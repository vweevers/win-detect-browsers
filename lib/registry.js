var exec = require('./exec')
  , util = require('util')
  , hives = ['HKEY_LOCAL_MACHINE', 'HKEY_CURRENT_USER']

module.exports = function(browser, keys, found, done) {
  var len = keys.length * hives.length
  function countdown() { if (--len===0) done() }

  keys.forEach(function(key){
    if (Array.isArray(key)) {
      // First query for version, then for path
      var versionKey  = key[0]
        , pathKey     = key[1]
        , withVersion = true
    }

    hives.forEach(function(hive){
      if (withVersion) {
        return reg(versionKey, hive, function (err, out) {
          var version = !err && getMatch(/([\d\.]+)/.exec(out))
          if (!version) return countdown()
          reg(pathKey, [hive, version], pathParser(version))
        })
      }

      reg(key, hive, pathParser(null))
    })
  })

  function pathParser(version) {
    return function(err, out) {
      var path = !err && getMatch(/([A-Z]:\\[^"$]+)/i.exec(out))
      path && found(browser, version, path)
      countdown()
    }
  }
}

function getMatch(matches) {
  if (!matches || !matches[1]) return
  else return matches[1].trim()
}

function reg(tpl, args, cb) {
  var q = util.format.apply(null, [tpl].concat(args))
  exec('reg', ['query', q], cb)
}