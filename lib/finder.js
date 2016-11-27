'use strict';

var debug    = require('debug')('win-detect-browsers')
  , which    = require('which')
  , env      = require('windows-env')
  , util     = require('util')
  , hives    = [ 'HKLM', 'HKCU' ]
  , after    = require('after')
  , path     = require('path')
  , existent = require('existent')
  , xtend    = require('xtend')
  , Emitter  = require('events').EventEmitter
  , versionInfo = require('./version-info')
  , extractPath = require('./extract-path')

module.exports = Finder

function Finder (name, meta, regStream, opts) {
  if (meta) for(var k in meta) this[k] = meta[k];

  this.name = name
  this.bin = this.bin || (name + '.exe')
  this.planned = 0
  this.regStream = this.reg = regStream

  // Results by path and invalid paths
  this.results = new Map
  this.ignored = new Set

  // Count the number of ways we found this browser
  this.methods = 0

  // In lucky mode, end after first result
  if (opts.lucky) this.once('first', this.end.bind(this))

  // Do browser-specific search
  this.find()
}

require('util').inherits(Finder, Emitter)

Finder.prototype.env = function (envVar) {
  this.file(null, env[envVar], envVar);
}

// Find by file location
Finder.prototype.file = function (envVar, file, method) {
  var done = this.plan()

  if (file === undefined) file = envVar, envVar = null
  else if (envVar) {
    if (!env[envVar]) return done()
    file = [env[envVar], file].join('\\')
  }

  if (!file) return done();

  existent(file, function (err) {
    if (err) return done()
    this.found(file, method || 'default location', done)
  }.bind(this))
}

// Find in a directory
Finder.prototype.dir = function (envVar, path) {
  if (path === undefined) path = envVar, envVar = null
  this.file(envVar, path + '\\' + this.bin)
}

// Find 32-bit or 64-bit version
Finder.prototype.programFiles = function (path) {
  this.dir('PROGRAMFILES_X86', path)
  if (env.X64) this.dir('PROGRAMFILES_X64', path)
}

// Find in PATH environment variable
Finder.prototype.inPath = function () {
  var done = this.plan()

  which(this.bin, function (err, path){
    if (err) return done()
    this.found(path, 'PATH', done)
  }.bind(this))
}

// Find in registry
Finder.prototype.registry = function (key, valueName, isParent, _useWoW) {
  // Also check 32-bit registry (only works if 64-bit `cscript` is used?)
  if (env.X64 && _useWoW!==false) {
    this.registry('Wow6432Node\\'+key, valueName, isParent, false)
  }

  var next = this.plan(hives.length)

  hives.forEach(function(hive){
    this.pathFromRegistry([hive, 'Software', key], valueName, isParent, next)
  }, this)
}

// Find in registry with version number
// First query for version, then for path
Finder.prototype.versionRegistry = function (vKey, vValue, pathKey, pathValue, _useWoW) {
  if (env.X64 && _useWoW!==false) {
    // Also check 32-bit registry
    this.versionRegistry(
      'Wow6432Node\\'+vKey, vValue,
      'Wow6432Node\\'+pathKey, pathValue,
      false
    )
  }

  var next = this.plan(hives.length)

  hives.forEach(function (hive){
    this.regQuery([hive, 'Software', vKey], vValue, function (err, out, key) {
      out = out && out.trim()
      if (!out) return next()

      debug('%s: found key "%s" in %s',
        this.name, out, debugKey(key, vValue))

      pathKey = util.format(pathKey, out)

      // Path is stored under a registry key like `33.0.2 (x86 en-US)`.
      this.pathFromRegistry([hive, 'Software', pathKey], pathValue, false, next)
    })
  }, this)
}

// Run a registry query and parse result for a path
Finder.prototype.pathFromRegistry = function (key, valueName, isParent, cb) {
  this.regQuery(key, valueName, function (err, out, key){
    if (!err && out) {
      var binary = extractPath(out.trim().split(/\r?\n/).pop())

      if (binary) {
        if (isParent && binary.slice(-4).toLowerCase() !== '.exe') {
          binary = path.join(binary, this.bin)
        }

        return this.found(binary, debugKey(key, valueName), cb)
      }
    }

    cb(err)
  })
}

// Find in StartMenuInternet registry key
Finder.prototype.startMenu = function (startEntry) {
  // eg, 'Google Chrome' or 'iexplore.exe'
  startEntry || (startEntry = this.bin)
  this.registry(
    'Clients\\StartMenuInternet\\' + startEntry +
    '\\shell\\open\\command'
  )
}

// Transform and normalize paths, then write them to stream
Finder.prototype.found = function (bin, metadata, method, cb, _skipPre) {
  if (this.closed) return

  if (typeof metadata === 'string') {
    _skipPre = cb, cb = method, method = metadata, metadata = null
  }

  if (bin) {
    if (this.pre && _skipPre !== false)
      return this.pre(bin, function (bin) {
        this.found(bin, metadata, method, cb, false);
      }.bind(this))

    bin = path.normalize(bin)

    const id = bin.toLowerCase()
    const debugName = [this.name]

    if (metadata) {
      if (metadata.channel) debugName.push(`(${metadata.channel})`)
      if (metadata.bitness) debugName.push(`(${metadata.bitness})`)
    }

    debug('Found %s:\n  - %s\n  @ %s', debugName.join(' '), bin, method)

    if (this.ignored.has(id)) {
      // Previously ignored
    } else if (this.results.has(id)) {
      this.methods++

      // Merge into previous result
      if (metadata) {
        const b = this.results.get(id)

        for(let k in metadata) {
          if (metadata[k] == null) continue

          if (b[k] != null && b[k] !== metadata[k]) {
            const v1 = JSON.stringify(b[k])
                , v2 = JSON.stringify(metadata[k])

            throw new Error(`Conflict on ${this.name}.${k}: ${v1} !== ${v2}`)
          } else {
            b[k] = metadata[k]
          }
        }
      }
    } else if (id.slice(-4) === '.exe') { // Ignore non-executable's
      let b = versionInfo({ name: this.name, path: bin })

      if (b && metadata) b = xtend(metadata, b)
      if (b && this.post) b = this.post(b)

      if (b) {
        this.methods++
        this.results.set(id, b)
        this.emit('first', b)
      } else {
        this.ignored.add(id)
      }
    }
  }

  cb && cb()
}

Finder.prototype.plan = function (n) {
  if (this._im) clearImmediate(this._im)

  ++this.planned

  var unplan = function (err) {
    if (err && !err.notFound) debug(err)

    if (--this.planned===0) {
      // allow more to be planned
      this._im = setImmediate(this.end.bind(this))
    }
  }.bind(this)

  return n > 1 ? after(n, unplan) : unplan;
}

Finder.prototype.end = function () {
  if (this.closed) return;

  // Destroy (TODO: no longer neccesary?)
  for(var m in this) {
    if (typeof this[m] == 'function' && m !== 'emit') this[m] = noop
  }

  this.closed = true
  this.emit('end', this.results, this.methods)
}

Finder.prototype.regQuery = function (key, valueName, cb) {
  this.regStream.value(key, valueName, cb.bind(this))
}

function debugKey (key, valueName) {
  return valueName ? key + ' /v ' + valueName : key;
}

function noop () {

}
