// Requirements to run tests: 
// 
// - Chrome
// - Firefox
// - Opera Stable, Beta and Developer

var test = require('tape')
  , detect = require('./')

test.only('detect all', function(t){
  t.plan(2)

  detect(function(results){
    var names = results.map(function(b){ return b.name })

    t.deepEqual(names.sort(), [
      'chrome', 'firefox', 'ie', 
      'opera', 'opera', 'opera', 'phantomjs'
    ])

    var len = results.filter(hasVersion).length
    t.equal(len, 7, 'have version numbers')
  })
})

test('detect chrome', function(t){
  t.plan(1)

  detect('chrome', function(results){
    t.equal(results[0].name, 'chrome', 'has name')
  })
})

test('detect chrome without version', function(t){
  t.plan(2)

  detect('chrome', {version: false}, function(results){
    t.equal(results[0].name, 'chrome', 'has name')
    t.notOk(results[0].version, 'has no version')
  })
})

test('detect chrome and firefox', function(t){
  t.plan(2)

  detect(['chrome', 'firefox'], function(results){
    var names = results.map(function(b){ return b.name })
    t.deepEqual(names.sort(), ['chrome', 'firefox'])
    var len = results.filter(hasVersion).length
    t.equal(len, 2, 'have version numbers')
  })
})

test('detect all opera versions', function(t){
  t.plan(2)

  detect('opera', function(results){
    t.equal(results.length, 3)

    var versions = results.map(function(b){ return b.version })
    var uniq = versions.filter(function(v, i){
      return versions.lastIndexOf(v)===i
    })

    t.equal(uniq.length, 3, 'unique versions')
  })
})

test('detect first opera version', function(t){
  t.plan(1)
  
  detect('opera', {lucky: true}, function(results){
    t.equal(results.length, 1)
  })
})

test('detect local phantomjs', function(t){
  t.plan(3)

  detect('phantomjs', function(results){
    t.equal(results.length, 1)
    t.equal(results[0].name, 'phantomjs')
    t.ok(hasVersion(results[0]), 'has version')
  })
})

function hasVersion(b){ 
  return b.version && b.version.match(/[\d\.]+/)
}
