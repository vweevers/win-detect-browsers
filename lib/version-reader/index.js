var debug      = require('debug')('win-detect-browsers')
  , through2   = require('through2')
  , execFile   = require('child_process').execFile
  , JSONStream = require('json-stream')
  , duplexify  = require('duplexify')
  , script     = require('path').join(__dirname, 'stream.wsf')
  , WIN_EOL    = '\r\n'

function encode(browser) {
  var str = browser.name + '\t' + browser.path
  return escape(str) + WIN_EOL
}

module.exports = function() {
  debug('create version stream')

  var output = JSONStream()

  var input = through2.obj(function write(browser, _, next) {
    if (!browser || !browser.name || !browser.path) return next()
    if (child.stdin.write(encode(browser))===false) child.stdin.once('drain', next)
    else next()
  }, function flush(cb) {
    if (child.stdin.writable) child.stdin.write(WIN_EOL);
    cb();
  })

  var duplex = duplexify.obj(input, output.pipe(withVersion()))

  var child = execFile('cscript', ['//Nologo', script], function done(err) {
    if (err) duplex.destroy(err);
  })
  
  child.stdout.pipe(output)

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
