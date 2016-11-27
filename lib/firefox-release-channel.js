'use strict';

module.exports = function releaseChannel(version) {
  var match = version.match(/([\d\.]+)(([ab]| RC)(\d+))?/)

  if (match !== null) {
    var major = parseInt(match[1])
    var mod = match[3] // undefined, a, b or RC
    var n = match[4]

    if (mod === 'a') {
      if (major < 5) return 'alpha'
      else if (n === '1') return 'nightly'
      else if (major < 35) return 'aurora'
      else return 'developer'
    } else if (mod === 'b') {
      return 'beta'
    } else if (mod === ' RC') {
      return 'rc' // pre firefox 5
    } else if (mod == null) {
      return 'release'
    }
  }

  return 'unknown'
}
