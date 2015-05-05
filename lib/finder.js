var debug    = require('debug')('win-detect-browsers')
  , which    = require('which')
  , env      = require('./env')
  , util     = require('util')
  , hives    = [ 'HKLM', 'HKCU' ]
  , after    = require('after')
  , path     = require('path')
  , through2 = require('through2')
  , exists   = require('path-exists')

module.exports = Finder

function Finder(name, meta, regStream, opts) {
  if (meta) for(var k in meta) this[k] = meta[k];

  this.name = name
  this.bin = this.bin || (name + '.exe')
  this.planned = 0
  this.regStream = regStream
  this.stream = through2.obj()

  // In lucky mode, end after first result
  if (opts.lucky) this.stream.once('data', this.end.bind(this))

  // Do browser-specific search
  this.find()

  return this.stream
}

Finder.prototype.env = function(envVar) {
  this.file(null, env[envVar], envVar);
}

// Find by file location
Finder.prototype.file = function(envVar, file, method) {
  var done = this.plan()

  if (file === undefined) file = envVar, envVar = null
  else if (envVar) {
    if (!env[envVar]) return done()
    file = [env[envVar], file].join('\\')
  }

  if (!file) return done();

  exists(file, function(err, exists){
    if (!exists) return done()
    this.found(file, method || 'default location', done)
  }.bind(this))
}

// Find in a directory
Finder.prototype.dir = function(envVar, path) {
  if (path === undefined) path = envVar, envVar = null
  this.file(envVar, path + '\\' + this.bin)
}

// Find 32-bit or 64-bit version
Finder.prototype.programFiles = function(path) {
  this.dir('PROGRAMFILES_X86', path)
  if (env.X64) this.dir('PROGRAMFILES_X64', path)
}

// Find in PATH environment variable
Finder.prototype.inPath = function() {
  var done = this.plan()

  which(this.bin, function(err, path){
    if (err) return done()
    this.found(path, 'PATH', done)
  }.bind(this))
}

// Find in registry
Finder.prototype.registry = function(key, valueName, isParent, _useWoW) { 
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

  hives.forEach(function(hive){
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
Finder.prototype.pathFromRegistry = function(key, valueName, isParent, cb) {
  this.regQuery(key, valueName, function(err, out, key){
    if (!err && out) { // find a path
      out = out.trim().split(/\r?\n/).pop()
      var m = /([a-z]:\\[^:\t"]+)/i.exec(out)
      var binary = m && m[1] && m[1].trim()

      if (binary) {
        if (isParent && binary.slice(-4).toLowerCase()!=='.exe') {
          binary = path.join(binary, this.bin)
        }
        return this.found(binary, debugKey(key, valueName), cb)
      }
    }

    cb(err)
  })
}

// Find in StartMenuInternet registry key
Finder.prototype.startMenu = function(startEntry) {
  // eg, 'Google Chrome' or 'iexplore.exe'
  startEntry || (startEntry = this.bin)
  this.registry(
    'Clients\\StartMenuInternet\\' + startEntry + 
    '\\shell\\open\\command'
  )
}

// Transform and normalize paths, then write them to stream
Finder.prototype.found = function(bin, method, cb, _doTransform) {
  if (this.closed) return;

  if (bin) {
    if (this.transform && _doTransform!==false)
      return this.transform(bin, function(bin){
        this.found(bin, method, cb, false);
      }.bind(this))

    bin = path.normalize(bin)

    debug('%s: found "%s" in %s', this.name, bin, method)

    // Ignore non-executable's
    if (bin.slice(-4).toLowerCase()==='.exe') {
      this.stream.write({ name: this.name, path: bin })
    }
  }

  cb && cb();
}

Finder.prototype.plan = function(n) {
  if (this._im) clearImmediate(this._im)

  ++this.planned
  
  var unplan = function() {   
    if (--this.planned===0) {
      // allow more to be planned
      this._im = setImmediate(this.end.bind(this))
    }
  }.bind(this)

  return n > 1 ? after(n, unplan) : unplan;
}

Finder.prototype.end = function() {
  if (this.closed) return;

  // Destroy (TODO: no longer neccesary?)
  for(var m in this) {
    if (typeof this[m] == 'function') this[m] = noop
  }

  this.closed = true
  this.stream.end()
}

Finder.prototype.regQuery = function(key, valueName, cb) {
  this.regStream.query(key, valueName, cb.bind(this))
}

function debugKey(key, valueName) {
  return valueName ? key + ' /v ' + valueName : key;
}

function noop() {

}
