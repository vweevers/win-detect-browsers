var debug      = require('debug')('win-detect-browsers')
  , vi         = require('win-version-info')
  , through2   = require('through2')

module.exports = function() {
  return through2.obj(function (b, enc, next) {
    if (!b || !b.path) {
      debug('empty browser', b)
      return next()
    }

    try {
      var info = vi(b.path)
    } catch(err) {
      debug('%s: win-version-info failed for %s', b.name, b.path, err)
      return next()
    }

    var version = info.FileVersion || info.ProductVersion

    if (!version) {
      debug('%s: no version for %s', b.name, b.path)
      return next()
    }

    b.version = version
    b.info = info

    return next(null, b)
  })
}
