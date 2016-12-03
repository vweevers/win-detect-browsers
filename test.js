'use strict';

// Requirements to run tests:
//
// - Chrome
// - Firefox
// - IE
//
// Opt-in functional tests:
//
// --opera: Opera Stable, Beta and Developer
// --phantomjs
// --canary

process.stderr.setMaxListeners(100)

const test = require('tape')
    , detect = require('./')
    , path = require('path')
    , compareVersion = require('compare-version')
    , wbin = require('windows-bin')

const argv = require('yargs')
    .boolean('opera')
    .boolean('canary')
    .boolean('phantomjs')
    .argv

test('find cscript', function (t) {
  t.plan(6)

  let async = false

  wbin('cscript', function (err, path) {
    t.ok(path, 'cb 1 has path')
    t.ok(async, 'cb 1 is async')
  })

  wbin('cscript', function (err, path) {
    t.ok(path, 'cb 2 has path')
    t.ok(async, 'cb 2 is async')

    let async2 = false

    wbin('cscript', function (err, path) {
      t.ok(path, 'cb 3 has path')
      t.ok(async2, 'cb 3 is async')
    })

    async2 = true
  })

  async = true
})

test('detect all', function (t) {
  t.plan(5)

  detect(function(err, results){
    t.ifError(err, 'no error')

    const names = results.map(b => b.name)
    const withVersions = results.filter(hasVersion).length

    t.ok(names.indexOf('chrome')>=0, 'found chrome')
    t.ok(names.indexOf('firefox')>=0, 'found firefox')
    t.ok(names.indexOf('ie')>=0, 'found ie')

    t.equal(withVersions, results.length, 'have version numbers')
  })
})

test('detect chrome', function (t) {
  detect('chrome', function (err, results) {
    t.ifError(err, 'no error')

    const names = results.filter(b => b.name === 'chrome')
    t.equal(names.length, results.length, 'have names')

    const versions = results.filter(hasVersion)
    t.equal(versions.length, results.length, 'have version numbers')

    if (argv.canary) {
      const msg = 'found ' + results.length + ' chrome versions'
      t.ok(results.length >= 2, msg)
    }

    t.end()
  })
})

test('detect chrome and firefox', function (t) {
  t.plan(4)

  detect(['chrome', 'firefox'], function (err, results) {
    t.ifError(err, 'no error')

    const names = results.map(b => b.name)
    const withVersions = results.filter(hasVersion).length

    t.ok(names.indexOf('chrome')>=0, 'found chrome')
    t.ok(names.indexOf('firefox')>=0, 'found firefox')
    t.ok(withVersions >= 2, 'have version numbers')
  })
})

test('detect first chrome and firefox', function (t) {
  t.plan(3)

  detect(['chrome', 'firefox'], { lucky: true }, function (err, results) {
    t.ifError(err, 'no error')

    const names = results.map(b => b.name).sort()

    t.deepEqual(names, ['chrome', 'firefox'], 'found chrome and firefox')
    t.equal(results.filter(hasVersion).length, 2, 'have version numbers')
  })
})

maybe(argv.opera)('detect all opera versions', function (t) {
  t.plan(3)

  detect('opera', function (err, results) {
    t.ifError(err, 'no error')
    t.equal(results.length, 3)

    const versions = results.map(b => b.version)
    const uniq = versions.filter((v, i) => versions.lastIndexOf(v) === i)

    t.equal(uniq.length, 3, 'unique versions')
  })
})

maybe(argv.phantomjs)('detect phantomjs', function (t) {
  t.plan(3)

  detect('phantomjs', function (err, results) {
    t.ifError(err, 'no error')
    t.equal(results[0].name, 'phantomjs')
    t.ok(hasVersion(results[0]), 'has version')
  })
})

test('concurrency', function (t) {
  const n = 5

  t.plan(n*3)
  for(let i=n; i>0; i--) chrome()

  function chrome () {
    detect('chrome', { lucky: true }, function (err, results) {
      t.ifError(err, 'no error')
      t.equal(results.length, 1)
      t.equal(results.filter(hasVersion).length, 1)
    })
  }
})

test('no result', function (t) {
  const browsers = {
    beep: {
      bin: 'beep.exe',
      find: function() {
        this.file('does\\not\\exist')
      }
    }
  }

  t.plan(2)

  detect({ browsers }, function (err, results) {
    t.ifError(err, 'no error')
    t.equal(results.length, 0)
  })
})

test('no result asynchronicity', function (t) {
  const browsers = {
    beep: {
      bin: 'beep.exe',
      find: function() {
        this.file()
      }
    }
  }

  t.plan(3)

  let async = false

  detect({browsers: browsers}, function (err, results) {
    t.ifError(err, 'no error')
    t.equal(results.length, 0)
    t.equal(async, true)
  })

  async = true
})

function hasVersion (b) {
  return b.version && b.version.match(/[\d\.]+/)
}

function maybe (enable) {
  return enable ? test : test.skip
}
