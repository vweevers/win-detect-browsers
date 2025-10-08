'use strict'

const after = require('after')
const Finder = require('./lib/finder')
const defaultBrowsers = require('./lib/browsers')

module.exports = function detect (names = null, options = null) {
  if (typeof names === 'string') {
    names = [names]
  }

  // So that tests can inject mock browsers
  const browsers = options?.browsers || defaultBrowsers

  if (!names || !names.length) {
    names = Object.keys(browsers)
  }

  return new Promise(function (resolve, reject) {
    const result = []
    const next = after(names.length, (err) => {
      if (err) reject(err)
      else resolve(result)
    })

    for (const name of names) {
      const browser = browsers[name]
      if (!browser) throw new Error('No such browser is defined: ' + name)

      // TODO: make async (and then remove `after`)
      // TODO: remove unused `methods` argument
      new Finder(name, browser).run((res, methods) => {
        for (const b of res.values()) result.push(b)
        next()
      })
    }
  })
}
