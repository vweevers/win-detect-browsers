'use strict'

// Requirements to run tests:
//
// - Chrome
// - Firefox
// - IE
// - .NET Framework
//
// Opt-in functional tests:
//
// --opera: requires Opera Stable, Beta and Developer
// --canary: requires Chrome Canary

process.stderr.setMaxListeners(100)

const test = require('tape')
const detect = require('./')
const path = require('path')
const gen = require('win-dummy-exe')
const env = require('windows-env')
const defaultBrowsers = require('./lib/browsers')
const ffChannel = require('./lib/firefox-release-channel')
const registry = require('./lib/registry')

const argv = require('yargs')
  .boolean('opera')
  .boolean('canary')
  .argv

test('find methods', function (t) {
  const methods = 8
  const mockRegistries = 3
  const wow = env.X64
  const hives = wow ? 4 : 2

  t.plan((methods * 2) + (mockRegistries * hives * 3))

  gen({ assemblyVersion: '1.0.0.0' }, function (err, exe) {
    if (err) throw err

    find('by file', function () {
      this.file(exe)
    })

    find('in directory', function () {
      this.dir(path.dirname(exe))
    })

    find('in subdirectory of env var', function () {
      const dirname = path.dirname(exe)
      env.METHODS_TEST_PATH = path.dirname(dirname)
      this.dir('METHODS_TEST_PATH', path.basename(dirname))
    })

    find('by env var', function () {
      env.METHODS_TEST_BIN = exe
      this.env('METHODS_TEST_BIN')
    })

    find('in PATH', function () {
      process.env.PATH = process.env.PATH + ';' + path.dirname(exe)
      this.inPath()
    })

    find('in registry value', function () {
      const unpatch = mockRegistry('a\\b', 'Path')
      this.registry('a\\b', 'Path')
      unpatch()
    })

    find('in registry default value', function () {
      const unpatch = mockRegistry('defval')
      this.registry('defval')
      unpatch()
    })

    find('parent directory in registry default value', function () {
      const unpatch = mockRegistry('App Paths\\dummy.exe', null, path.dirname(exe))
      this.registry('App Paths\\dummy.exe', null, true)
      unpatch()
    })

    function mockRegistry (expectedKey, expectedValue, result) {
      const stack = []

      if (wow) {
        stack.push(['HKLM', 'Software', 'Wow6432Node\\' + expectedKey])
        stack.push(['HKCU', 'Software', 'Wow6432Node\\' + expectedKey])
      }

      stack.push(['HKLM', 'Software', expectedKey])
      stack.push(['HKCU', 'Software', expectedKey])

      const getValue = function (hive, key, value, done) {
        const expectedKey = stack.shift()
        const expectedHive = expectedKey.shift()
        const stringKey = expectedKey.join('\\')

        t.same(hive, expectedHive, expectedHive)
        t.same(key, expectedKey, stringKey)
        t.same(value, expectedValue, String(expectedValue))

        done(null, result || exe, hive + '\\' + key)
      }

      const getValues = function () {
        throw new Error('not testable yet')
      }

      const originalValue = registry.value
      const originalValues = registry.values

      registry.value = getValue
      registry.values = getValues

      return function unpatch () {
        registry.value = originalValue
        registry.values = originalValues
      }
    }

    function find (method, fn, done) {
      const browsers = {
        methods_test: {
          bin: 'dummy.exe',
          find: fn
        }
      }

      detect({ browsers }, function (err, results) {
        t.ifError(err, 'no detect error')

        t.same(results, [{
          name: 'methods_test',
          path: exe,
          version: '1.0.0.0',
          arch: 'i386',
          info: {
            FileVersion: '1.0.0.0',
            InternalName: 'dummy.exe',
            OriginalFilename: 'dummy.exe'
          }
        }], method)
      })
    }
  })
})

test('ignores non-exe', function (t) {
  t.plan(2)

  const browsers = {
    test: {
      bin: 'test.js',
      find: function () {
        this.dir(__dirname)
      }
    }
  }

  detect({ browsers }, function (err, results) {
    t.ifError(err, 'no error')
    t.is(results.length, 0, 'no results')
  })
})

test('prefers FileVersion over ProductVersion', function (t) {
  t.plan(4)

  gen({ assemblyFileVersion: '1.2.3.4', assemblyInformationalVersion: '1.0' }, function (err, exe1) {
    t.ifError(err, 'no gen error (1)')

    gen({ assemblyInformationalVersion: '1.0' }, function (err, exe2) {
      t.ifError(err, 'no gen error (2)')

      const browsers = {
        test: {
          bin: 'dummy.exe',
          find: function () {
            this.dir(path.dirname(exe1))
            this.dir(path.dirname(exe2))
          }
        }
      }

      detect({ browsers }, function (err, results) {
        t.ifError(err, 'no error')
        t.same(results.sort((a, b) => a.path > b.path ? 1 : -1), [
          {
            name: 'test',
            path: exe1,
            version: '1.2.3.4',
            arch: 'i386',
            info: {
              FileVersion: '1.2.3.4',
              InternalName: 'dummy.exe',
              OriginalFilename: 'dummy.exe',
              ProductVersion: '1.0'
            }
          },
          {
            name: 'test',
            path: exe2,
            version: '1.0',
            arch: 'i386',
            info: {
              InternalName: 'dummy.exe',
              OriginalFilename: 'dummy.exe',
              ProductVersion: '1.0'
            }
          }
        ])
      })
    })
  })
})

test('ignores exe without version', function (t) {
  t.plan(3)

  gen(function (err, exe) {
    t.ifError(err, 'no gen error')

    const browsers = {
      test: {
        bin: 'dummy.exe',
        find: function () {
          this.dir(path.dirname(exe))
        }
      }
    }

    detect({ browsers }, function (err, results) {
      t.ifError(err, 'no error')
      t.is(results.length, 0, 'no results')
    })
  })
})

test('firefox release channels', function (t) {
  const versions = {
    '1.0': 'release',
    '2.0a1': 'alpha',
    '2.0b1': 'beta',
    '2.0 RC1': 'rc',
    '34.0a2': 'aurora',
    '34.0b2': 'beta',
    '35.0a2': 'developer',
    '45.0esr': 'esr',
    '52.0': 'release',
    '53.0a1': 'nightly',
    '53.0a2': 'developer'
  }

  for (const k in versions) {
    t.is(ffChannel(k), versions[k], `${k} == ${versions[k]}`)
  }

  t.end()
})

test('firefox channel from ProductVersion', function (t) {
  t.plan(3)

  gen({ assemblyFileVersion: '53.0.0.6175', assemblyInformationalVersion: '53.0a1' }, function (err, exe) {
    t.ifError(err, 'no gen error')

    const browsers = {
      firefox: {
        bin: 'dummy.exe',
        find: function () {
          this.dir(path.dirname(exe))
        },
        post: defaultBrowsers.firefox.post
      }
    }

    detect({ browsers, channel: true }, function (err, results) {
      t.ifError(err, 'no error')
      t.same(results, [
        {
          channel: 'nightly',
          name: 'firefox',
          path: exe,
          version: '53.0.0.6175',
          arch: 'i386',
          info: {
            FileVersion: '53.0.0.6175',
            InternalName: 'dummy.exe',
            OriginalFilename: 'dummy.exe',
            ProductVersion: '53.0a1'
          }
        }
      ])
    })
  })
})

test('firefox developer channel from ProductName', function (t) {
  t.plan(3)

  gen({ assemblyFileVersion: '1.0.0.0', assemblyProduct: 'FirefoxDeveloperEdition' }, function (err, exe) {
    t.ifError(err, 'no gen error')

    const browsers = {
      firefox: {
        bin: 'dummy.exe',
        find: function () {
          this.dir(path.dirname(exe))
        },
        post: defaultBrowsers.firefox.post
      }
    }

    detect({ browsers, channel: true }, function (err, results) {
      t.ifError(err, 'no error')
      t.same(results, [
        {
          channel: 'developer',
          name: 'firefox',
          path: exe,
          version: '1.0.0.0',
          arch: 'i386',
          info: {
            FileVersion: '1.0.0.0',
            InternalName: 'dummy.exe',
            OriginalFilename: 'dummy.exe',
            ProductName: 'FirefoxDeveloperEdition'
          }
        }
      ])
    })
  })
})

test('detect all', function (t) {
  t.plan(5)

  detect(function (err, results) {
    t.ifError(err, 'no error')

    const names = results.map(b => b.name)
    const withVersions = results.filter(hasVersion).length

    t.ok(names.indexOf('chrome') >= 0, 'found chrome')
    t.ok(names.indexOf('firefox') >= 0, 'found firefox')
    t.ok(names.indexOf('ie') >= 0, 'found ie')

    t.equal(withVersions, results.length, 'have version numbers')
  })
})

test('detect all with promise', async function (t) {
  const results = await detect()
  const names = results.map(b => b.name)
  const withVersions = results.filter(hasVersion).length

  t.ok(names.indexOf('chrome') >= 0, 'found chrome')
  t.ok(names.indexOf('firefox') >= 0, 'found firefox')
  t.ok(names.indexOf('ie') >= 0, 'found ie')

  t.equal(withVersions, results.length, 'have version numbers')
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

test('detect chrome with promise', async function (t) {
  const results = await detect('chrome')
  const names = results.filter(b => b.name === 'chrome')
  t.equal(names.length, results.length, 'have names')

  const versions = results.filter(hasVersion)
  t.equal(versions.length, results.length, 'have version numbers')

  if (argv.canary) {
    const msg = 'found ' + results.length + ' chrome versions'
    t.ok(results.length >= 2, msg)
  }
})

test('detect chrome and firefox', function (t) {
  t.plan(4)

  detect(['chrome', 'firefox'], function (err, results) {
    t.ifError(err, 'no error')

    const names = results.map(b => b.name)
    const withVersions = results.filter(hasVersion).length

    t.ok(names.indexOf('chrome') >= 0, 'found chrome')
    t.ok(names.indexOf('firefox') >= 0, 'found firefox')
    t.ok(withVersions >= 2, 'have version numbers')
  })
})

test('detect chrome and firefox with promise', async function (t) {
  const results = await detect(['chrome', 'firefox'])
  const names = results.map(b => b.name)
  const withVersions = results.filter(hasVersion).length

  t.ok(names.indexOf('chrome') >= 0, 'found chrome')
  t.ok(names.indexOf('firefox') >= 0, 'found firefox')
  t.ok(withVersions >= 2, 'have version numbers')
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

test('concurrency', function (t) {
  const n = 5

  t.plan(n * 2)
  for (let i = n; i > 0; i--) chrome()

  function chrome () {
    detect('chrome', function (err, results) {
      t.ifError(err, 'no error')
      t.ok(results.length >= 1)
    })
  }
})

test('no result', function (t) {
  const browsers = {
    beep: {
      bin: 'beep.exe',
      find: function () {
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
      find: function () {
        this.file()
      }
    }
  }

  t.plan(3)

  let async = false

  detect({ browsers }, function (err, results) {
    t.ifError(err, 'no error')
    t.equal(results.length, 0)
    t.equal(async, true)
  })

  async = true
})

test('no result with promise', async function (t) {
  const browsers = {
    beep: {
      bin: 'beep.exe',
      find: function () {
        this.file()
      }
    }
  }

  const results = await detect({ browsers })
  t.equal(results.length, 0)
})

function hasVersion (b) {
  return b.version && b.version.match(/[\d.]+/)
}

function maybe (enable) {
  return enable ? test : test.skip
}
