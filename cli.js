#!/usr/bin/env node
'use strict'

const names = Object.keys(require('./lib/browsers'))

const argv = require('yargs')
  .usage([
    'win-detect-browsers [options] [name, name..]\n',
    'Write browsers to stdout as a JSON array.\n',
    'Includes all browsers unless one or more names are given:',
    names.map(name => '  ' + name).join('\n')
  ].join('\n'))
  .boolean('summary')
  .boolean('debug')
  .describe('summary', 'Less properties')
  .describe('debug', 'Enable debug output')
  .describe('version', 'Show CLI version number')
  .alias({
    version: 'v',
    help: 'h',
    summary: 's',
    debug: 'd'
  })
  .argv

if (argv.debug) {
  require('debug').enable('win-detect-browsers')
}

const detect = require('.')
const start = Date.now()

detect(argv._, function (err, browsers, methods) {
  if (err) throw err

  const duration = Date.now() - start

  if (argv.summary) {
    browsers = browsers.map(b => {
      const { name, version, channel, arch, path } = b
      return { name, path, version, channel, arch }
    })
  }

  console.log(JSON.stringify(browsers.map(ordered), null, 2))
  console.error('\nFound %d browsers in %d ways within %dms.', browsers.length, methods, duration)
})

function ordered (a) {
  const b = {}
  const remaining = new Set(Object.keys(a))
  const objects = []

  for (const k of ['name', 'path', 'version', 'channel', 'arch']) {
    if (k in a) {
      b[k] = a[k]
      remaining.delete(k)
    }
  }

  for (const k of remaining) {
    if (typeof a[k] === 'object') objects.push(k)
    else b[k] = a[k]
  }

  for (const k of objects.sort()) {
    b[k] = a[k]
  }

  return b
}
