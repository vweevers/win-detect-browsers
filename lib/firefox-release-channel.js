'use strict';

const VERSION_RE = /([\d\.]+)(([ab]| RC)(\d+))?/

module.exports = function releaseChannel (version) {
  const match = version.match(VERSION_RE)

  if (match !== null) {
    const major = parseInt(match[1])
        , mod = match[3] // undefined, a, b or RC
        , n = match[4]

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
