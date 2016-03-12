var debug      = require('debug')('win-detect-browsers')
  , execFile   = require('child_process').execFile
  , JSONStream = require('json-stream')
  , duplexify  = require('duplexify')
  , script     = require('path').join(__dirname, 'stream.wsf')
  , wbin       = require('windows-bin')
  , writer     = require('flush-write-stream')
  , WIN_EOL    = '\r\n'

function encode(browser) {
  var str = browser.name + '\t' + browser.path
  return escape(str) + WIN_EOL
}

module.exports = function() {
  debug('create version stream')

  var output = JSONStream()
    , duplex = duplexify.obj(null, output)

  wbin('cscript', function(err, bin){
    if (err) return duplex.destroy(err)

    var input = writer.obj(function write(browser, _, next) {
      if (!browser || !browser.name || !browser.path) return next()
      if (child.stdin.write(encode(browser))===false) child.stdin.once('drain', next)
      else next()
    }, function flush(cb) {
      if (child.stdin.writable) child.stdin.write(WIN_EOL, cb)
      else cb()
    })

    var child = execFile(bin, ['//Nologo', script], function done(err) {
      if (err) duplex.destroy(err)
    })

    child.stdout.pipe(output)
    duplex.setWritable(input)
  })

  // Errors from input and output bubble to duplex
  duplex.on('error', debug)

  return duplex;
}
