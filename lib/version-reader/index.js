var debug      = require('debug')('win-detect-browsers')
  , through2   = require('through2')
  , execFile   = require('child_process').execFile
  , JSONStream = require('json-stream')
  , duplexify  = require('duplexify')
  , script     = require('path').join(__dirname, 'stream.wsf')
  , cscript    = require('../cscript')
  , WIN_EOL    = '\r\n'

function encode(browser) {
  var str = browser.name + '\t' + browser.path
  return escape(str) + WIN_EOL
}

module.exports = function() {
  debug('create version stream')

  var output = JSONStream()
    , duplex = duplexify.obj(null, output.pipe(withVersion()))

  cscript(function(err, bin){
    if (err) return duplex.destroy(err)

    var input = through2.obj(function write(browser, _, next) {
      if (!browser || !browser.name || !browser.path) return next()
      if (child.stdin.write(encode(browser))===false) child.stdin.once('drain', next)
      else next()
    }, function flush(cb) {
      if (child.stdin.writable) child.stdin.write(WIN_EOL);
      cb();
    })

    var child = execFile(bin, ['//Nologo', script], function done(err) {
      if (err) duplex.destroy(err);
    })

    child.stdout.pipe(output)
    duplex.setWritable(input)
  })

  // Errors from input and output bubble to duplex
  duplex.on('error', debug)

  return duplex;
}

function withVersion() {
  return through2.obj(function(b, _, next){
    if (b.version) this.push(b)
    else debug('%s: no version for %s', b.name, b.path)
    next()
  })
}
