'use strict';

var debug = require('debug')('win-detect-browsers')
  , vi = require('win-version-info')

module.exports = function annotate (b) {
  try {
    var info = vi(b.path)
  } catch(err) {
    debug('%s: win-version-info failed for %s', b.name, b.path, err)
    return
  }

  var version = info.FileVersion || info.ProductVersion

  if (!version) {
    debug('%s: no version for %s', b.name, b.path)
    return
  }

  b.version = version
  b.info = info

  return b
}
