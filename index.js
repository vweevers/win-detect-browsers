var Finder = require('./lib/finder')
  , xtend = require('xtend')
  , debug = require('debug')('win-detect-browsers')
  , path = require('path')
  , regStream = require('./lib/reg-stream')
  , getVersion = require('./lib/version-reader')
  , merge = require('merge-stream')
  , concat = require('concat-stream')
  , unique = require('unique-stream')
  , through2 = require('through2')

var defaults = {
  lucky: false,
  version: true,
  browsers: require('./lib/browsers')
}

module.exports = function (names, opts, cb) {
  if (typeof names == 'string') names = [names]
  else if (!Array.isArray(names)) cb = opts, opts = names, names = null

  if (typeof opts == 'function') cb = opts, opts = xtend(defaults)
  else opts = xtend(defaults, opts)

  var browsers = opts.browsers
    , reg = regStream()

  if (!names || !names.length)
    names = Object.keys(browsers)

  var stream = merge(names.map(function (name) {
    return new Finder(name, browsers[name], reg, opts)
  })).pipe(unique(function (b) {
    return b.path.toLowerCase()
  }))

  if (opts.version) {
    stream = stream.pipe(getVersion())
  }

  stream.on('end', reg.end.bind(reg))
  if (cb) stream.pipe(concat(cb))

  return stream;
}
