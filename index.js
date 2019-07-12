'use strict'

const Finder = require('./lib/finder')
const xtend = require('xtend')
const after = require('after')

const DEFAULTS = {
  browsers: require('./lib/browsers')
}

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
    opts = xtend(DEFAULTS)
  } else {
    opts = xtend(DEFAULTS, opts)
  }

  if (!names || !names.length) {
    names = Object.keys(opts.browsers)
  }

  const result = []
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

  function finish (err) {
    if (err) done(err)
    else done(err, result, totalMethods)
  }
}
