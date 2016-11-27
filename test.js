'use strict';

// Requirements to run tests:
//
// - Chrome
// - Firefox
// - IE
// - Opera Stable, Beta and Developer
//
// If only Opera Stable is installed, run
// test with `--no-operaversions`
//
// If both Chrome stable and Chrome Canary
// are installed, run test with `--canary`

process.stderr.setMaxListeners(100)

var test = require('tape')
  , detect = require('./')
  , path = require('path')
  , compareVersion = require('compare-version')

var argv = require('yargs')
  .boolean('operaversions')
  .boolean('canary')
  .default({ operaversions : true, canary: false })
  .argv;

test('find cscript', function(t){
  t.plan(6)

  var wbin = require('windows-bin'), async = false

  wbin('cscript', function(err, path){
    t.ok(path, 'cb 1 has path')
    t.ok(async, 'cb 1 is async')
  })

  wbin('cscript', function(err, path){
    t.ok(path, 'cb 2 has path')
    t.ok(async, 'cb 2 is async')

    var async2 = false
    wbin('cscript', function(err, path){
      t.ok(path, 'cb 3 has path')
      t.ok(async2, 'cb 3 is async')
    })
    async2 = true
  })

  async = true
})

test('detect all', function(t){
  t.plan(6)

  detect(function(err, results){
    t.ifError(err, 'no error')

    var names = results.map(function(b){ return b.name })

    t.ok(names.indexOf('chrome')>=0, 'found chrome')
    t.ok(names.indexOf('firefox')>=0, 'found firefox')
    t.ok(names.indexOf('ie')>=0, 'found ie')
    t.ok(names.indexOf('opera')>=0, 'found opera')

    var len = results.filter(hasVersion).length
    t.equal(len, results.length, 'have version numbers')
  })
})

test('detect chrome', function(t){
  detect('chrome', function(err, results){
    t.ifError(err, 'no error')

    var names = results.filter(function(b){ return b.name === 'chrome' })
    t.equal(names.length, results.length, 'have names')

    var versions = results.filter(hasVersion)
    t.equal(versions.length, results.length, 'have version numbers')

    if (argv.canary) {
      var msg = 'found ' + results.length + ' chrome versions'
      t.ok(results.length >= 2, msg)
    }

    t.end()
  })
})

test('detect chrome and firefox', function(t){
  t.plan(4)

  detect(['chrome', 'firefox'], function(err, results){
    t.ifError(err, 'no error')

    var names = results.map(function(b){ return b.name })

    t.ok(names.indexOf('chrome')>=0, 'found chrome')
    t.ok(names.indexOf('firefox')>=0, 'found firefox')

    var len = results.filter(hasVersion).length
    t.ok(len>=2, 'have version numbers')
  })
})

test('detect first chrome and firefox', function(t){
  t.plan(3)

  detect(['chrome', 'firefox'], {lucky: true}, function(err, results){
    t.ifError(err, 'no error')

    var names = results.map(function(b){ return b.name })

    names.sort()

    t.deepEqual(names, ['chrome', 'firefox'], 'found chrome and firefox')
    t.equal(results.filter(hasVersion).length, 2, 'have version numbers')
  })
})

;(argv.operaversions ? test : test.skip)('detect all opera versions', function(t){
  t.plan(3)

  detect('opera', function(err, results){
    t.ifError(err, 'no error')
    t.equal(results.length, 3)

    var versions = results.map(function(b){ return b.version })
    var uniq = versions.filter(function(v, i){
      return versions.lastIndexOf(v)===i
    })

    t.equal(uniq.length, 3, 'unique versions')
  })
})

test('detect first opera version', function(t){
  t.plan(2)

  detect('opera', {lucky: true}, function(err, results){
    t.ifError(err, 'no error')
    var names = results.map(function(b){ return b.name })
    t.deepEqual(names, ['opera'])
  })
})

test.skip('detect phantomjs', function(t){
  t.plan(3)

  detect('phantomjs', function(err, results){
    t.ifError(err, 'no error')
    t.equal(results[0].name, 'phantomjs')
    t.ok(hasVersion(results[0]), 'has version')
  })
})

test('concurrency', function(t){
  var n = 5

  t.plan(n*3)
  for(var i=n; i>0; i--) chrome()

  function chrome() {
    detect('chrome', {lucky: true}, function(err, results){
      t.ifError(err, 'no error')
      t.equal(results.length, 1)
      t.equal(results.filter(hasVersion).length, 1)
    })
  }
})

test('no result', function(t){
  var browsers = {
    beep: {
      bin: 'beep.exe',
      find: function() {
        this.file('does\\not\\exist')
      }
    }
  }

  t.plan(2)
  detect({browsers: browsers}, function(err, results){
    t.ifError(err, 'no error')
    t.equal(results.length, 0)
  })
})

test('no result asynchronicity', function(t){
  var browsers = {
    beep: {
      bin: 'beep.exe',
      find: function() {
        this.file()
      }
    }
  }

  t.plan(3)

  var async = false
  detect({browsers: browsers}, function(err, results){
    t.ifError(err, 'no error')
    t.equal(results.length, 0)
    t.equal(async, true)
  })

  async = true;
})

function hasVersion(b){
  return b.version && b.version.match(/[\d\.]+/)
}
