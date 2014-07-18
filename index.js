var which = require('which')
  , fs = require('fs')
  , npath = require('path')
  , exec = require('./lib/exec')
  , registry = require('./lib/registry')
  , browsers = require('./lib/browsers')

module.exports = function(complete) {
  // Will hold detected browsers
  var results = {}

  // Gather finders
  var finders = []
  for(var bname in browsers)
    getFinders(bname, browsers[bname], finders)

  // Run finders
  var numTasks = finders.length
  finders.forEach(function(finder){
    finder(function () {
      if (--numTasks===0) {
        // Then retrieve version numbers 
        // and return results.
        getVersionNumbers(results, toArray)
      }
    })
  })

  // 
  function toArray(browsers) {
    var a = []

    for(var k in browsers)
      a.push(browsers[k])

    complete(a)
  }

  // Callback to gather results. If no version
  // is given it will be retrieved later.
  function found(name, version, path) {
    if (results[path] != null) {
      var prev = results[path]
      if (!prev.version) prev.version = version
      return
    }

    results[path] = {
      name: name,
      version: version,
      path: path
    }
  }

  function getFinders(browser, opts, acc) {
    var exe = opts.file || (browser + '.exe')

    // Common registry keys
    if (opts.registry) {
      acc.push(function(done){
        registry(browser, opts.registry, found, done)
      })
    }

    // Common locations
    if (opts.locations) {
      opts.locations.forEach(function(path){
        if (!path || !path[0]) return
        acc.push(function(done){
          path.push(exe)
          path = path.join('\\')

          // Because WMIC is slow, check existence first
          fs.exists(path, function(exists){
            if(exists) found(browser, null, path)
            done()
          })
        })
      })
    }

    // Find in PATH
    acc.push(function(done){
      which(exe, function(err, path){
        path && found(browser, null, path)
        done()
      })
    })
  }
}

// Retrieve version number with WMIC. Runs 
// sequential, because WMIC cant handle 
// concurrent calls.
function getVersionNumbers(browsers, done) {
  var paths = Object.keys(browsers)
    , index = paths.length

  next() // Start iteration

  function next() {
    if (--index==-1) {
      // WMIC creates a temporary file for some reason
      var tmpfile = npath.join(__dirname, 'TempWmicBatchFile.bat')
      return fs.unlink(tmpfile, function(){
        done(browsers)
      })
    }

    var path = paths[index]
      , browser = browsers[path]

    if (browser.version) return next()

    // Escape much?
    var escaped = browser.path.replace(/\\/g, '\\\\')
    
    var args = [
      'datafile where Name="' + escaped + '"', 
      'get Version /format:value'
    ]
    
    exec('wmic', args, function(err, out){
      // "Version=xx"
      var version = !err && out.split('=')[1]

      if (version) browser.version = version
      else delete browsers[path]

      next()
    })
  }
}
