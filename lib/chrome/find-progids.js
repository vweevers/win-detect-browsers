'use strict';

const extractPath = require('../extract-path')
    , after = require('after')

module.exports = function findProgIds () {
  // We could read HKCR, which is composed of HKLM\Software\Classes and
  // HKCU\Software\Classes, but that hive is only refreshed on restart.
  const next = this.plan(2)

  queryHive(this, 'HKCU', next)
  queryHive(this, 'HKLM', next)
}

function queryHive (self, hive, done) {
  const classes = `${hive}\\Software\\Classes`

  self.reg.values(`${classes}\\.html\\OpenWithProgids`, (err, values) => {
    if (err) return done(err.notFound ? null : err)

    const progids = Object.keys(values).filter(isChromeHTML)
    const next = after(progids.length, done)

    progids.forEach(function(id) {
      const key = `${classes}\\${id}\\shell\\open\\command`

      self.reg.value(key, (err, bin) => {
        if (err) return next(err.notFound ? null : err)

        const metadata = {
          channel: id === 'ChromeHTML' ? 'stable' : 'canary'
        }

        self.found(extractPath(bin), metadata, key, next)
      })
    })
  })
}

function isChromeHTML (id) {
  return id === 'ChromeHTML' || id.slice(0, 12) === 'ChromeSSHTM.'
}
