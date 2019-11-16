#!/usr/bin/env node
'use strict'

const names = Object.keys(require('./lib/browsers'))

const argv = require('yargs')
  .usage([
    'win-detect-browsers [options] [name, name..]\n',
    'Names:',
    names.map(name => '  ' + name).join('\n')
  ].join('\n'))
  .boolean('json')
  .boolean('summary')
  .boolean('debug')
  .describe('json', 'Print results as JSON array')
  .describe('summary', 'Less properties')
  .describe('debug', 'Enable debug scope')
  .describe('version', 'Show CLI version number')
  .alias({
    version: 'v',
    help: 'h',
    json: 'j',
    summary: 's',
    debug: 'd'
  })
  .argv

if (argv.debug) {
  require('debug').enable('win-detect-browsers')
}

const detect = require('.')
const start = Date.now()

detect(argv._, argv, function (err, browsers, methods) {
  if (err) throw err

  const duration = Date.now() - start

  if (argv.json) {
    if (argv.summary) {
      browsers = browsers.map(b => {
        const { name, version, channel, arch, path } = b
        return { name, path, version, channel, arch }
      })
    }

    console.log(JSON.stringify(browsers.map(ordered), null, 2))
    console.log()
  } else {
    const tree = require('pretty-tree')
    const chalk = require('chalk')
    const pascal = require('pascal-case')

    browsers.forEach(function print (b) {
      const labels = [b.name.toUpperCase(), major(b.version)]

      if (b.channel) {
        labels.push(b.channel.toUpperCase())
      }

      if (b.arch === 'amd64') {
        labels.push('64-bit')
      } else if (b.arch === 'i386') {
        labels.push('32-bit')
      }

      const label = chalk.white(labels.join(' '))
      const atomic = ['path', 'version', 'guid'].filter(key => b[key] != null)
      const nonAtomic = Object.keys(b).filter(key => isObject(b[key]))

      const pad = atomic.reduce(function (max, key) {
        return max.length >= key.length ? max : key.replace(/./g, ' ')
      }, ' ')

      const nodes = atomic.map(key => {
        const value = b[key]

        key = key === 'guid' ? 'GUID' : pascal(key)
        key = key + ':' + pad.slice(key.length - pad.length - 1)

        return chalk.cyan(key) + value
      })

      if (!argv.summary) {
        for (const key of nonAtomic) {
          nodes.push({ label: pascal(key), leaf: b[key] })
        }
      }

      console.log(tree({ label, nodes }))
    })
  }

  console.error('Found %d browsers in %d ways within %dms.', browsers.length, methods, duration)
})

function isObject (value) {
  return typeof value === 'object' && value !== null
}

function major (version) {
  return version.split(/[^\d]+/)[0]
}

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
