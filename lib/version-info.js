'use strict';

const debug = require('debug')('win-detect-browsers')
const vi = process.platform === 'win32' ? require('win-version-info') : tryRequire()

function tryRequire () {
  try {
    return require('win-version-info')
  } catch (err) {
    debug(err)

    return function noop () {
      return {}
    }
  }
}

module.exports = function annotate (b) {
  try {
    var info = vi(b.path)
  } catch (err) {
    debug('%s: win-version-info failed for %s', b.name, b.path, err)
    return
  }

  const version = info.FileVersion || info.ProductVersion

  if (!version) {
    debug('%s: no version for %s', b.name, b.path)
    return
  }

  b.version = version
  b.info = info

  return b
}
