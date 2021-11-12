'use strict'

const { fromCallback } = require('catering')
const after = require('after')
const Finder = require('./lib/finder')

const DEFAULTS = { browsers: require('./lib/browsers') }
const kPromise = Symbol('promise')

module.exports = function detect (names, opts, done) {
  if (typeof names === 'string') {
    names = [names]
  } else if (!Array.isArray(names)) {
    done = opts
    opts = names
    names = null
  }

  if (typeof opts === 'function') {
    done = opts
    opts = Object.assign({}, DEFAULTS)
  } else {
    opts = Object.assign({}, DEFAULTS, opts)
  }

  done = fromCallback(done, kPromise)

  if (!names || !names.length) {
    names = Object.keys(opts.browsers)
  }

  const result = []
  const finish = (err) => err ? done(err) : done(null, result, totalMethods)
  const next = after(names.length, finish)

  // For debugging: count the number
  // of ways we found the browsers.
  let totalMethods = 0

  names.forEach(function (name) {
    const browser = opts.browsers[name]
    if (!browser) throw new Error('No such browser is defined: ' + name)

    const f = new Finder(name, browser, opts)

    f.on('error', next).on('end', (res, methods) => {
      for (const b of res.values()) result.push(b)
      totalMethods += methods
      next()
    })
  })

  return done[kPromise]
}
