var exec    = require('./exec')
  , debug   = require('debug')('win-detect-browsers')
  , retry   = require('retry')
  , path    = require('path')

// Documentation for WMIC: 
// - http://ss64.com/nt/wmic.html
// - http://msdn.microsoft.com/en-us/library/aa394531(v=vs.85).aspx

function normalize(bin) {
  return path.normalize(bin).toLowerCase()
}

module.exports = function(browsers, cb) {
  var map = Object.create(null)

  browsers.forEach(function(b){
    // Normalize for comparison with wmic paths
    map[normalize(b.path)] = b
  })

  // Escaping paths is tricky. Before we used an OR-query
  // that had to be enclosed in parentheses: `where
  // (Name="path1" or Name="path2")` - but then, WMIC
  // tripped on paths with parentheses. Now we send
  // multiple queries via stdin, which solves the
  // parentheses issue. All characters except comma's
  // work fine. Seems to be impossible to escape comma's.
  // - https://stackoverflow.com/a/18003320
  // - https://stackoverflow.com/a/23838032

  var queries = Object.keys(map).map(function(p){
    if (~p.indexOf(',')) {
      debug('Unsupported path (has comma): %s', p)
      p = p.replace(/,/g, '')
    }
    // Double escape slashes
    p = p.replace(/\\|\//g, '\\\\')
    return 'datafile where Name="'+p+'" get Name,Version'
  })

  debug("Getting version numbers using WMIC datafile")

  // Retry with exponential backoff, in case WMIC is 
  // busy (it can't handle concurrent calls on XP).
  var operation = retry.operation({ retries: 10 })
  var opts = {stdio: ['pipe', 'pipe', 'ignore']}

  operation.attempt(function(attempts) {
    var child = exec('wmic', [], opts, function(err, out) {
      // Handle not found error
      if (err && err.code=='ENOENT') return cb(err)

      if (operation.retry(err)) {
        if (err.code!=32 && err.message!=='No output') debug(err)
        return debug('WMIC retry %d', attempts)
      }

      if (err) return cb(operation.mainError())

      var lines = out.split(/[\r\n]+/).filter(function(line){
        // remove prompt lines and tsv headers
        return line.indexOf('>')<0 && line.slice(0,4)!=='Name'
      })

      // Order is Name, Version (columns are alphabetically sorted).
      lines.forEach(function(line){
        var cols    = line.split(/\t|  /)
          , path    = cols[0].toLowerCase()
          , version = cols[1]

        // ampersands are encoded for some reason
        path = normalize(path.replace(/&amp;/g, '&'))

        if (path in map) {
          var browser = map[path]
          
          if (version = version && /[\d\.]+/.exec(version)) {
            debug('v%s: "%s"', version, browser.path)
            browser.version = version[0]
          } else {
            debug('Invalid number "%s" for "%s"', version, browser.path)
          }
        } else {
          debug('Unknown path: %s', path)
        }
      })

      cb()
    })

    // Avoid unhandled errors
    child.stdin.on('error', function(){})

    // Force US english for Windows < 2003
    child.stdin.write('/locale:ms_409\n');

    queries.forEach(function(q){
      child.stdin.write(q+'\n')
    })

    // Note that WMIC doesn't execute queries until
    // stdin ends. The QUIT command makes it exit
    // nicely.
    child.stdin.end('QUIT\n')
  })
}
