var execFile   = require('child_process').execFile
  , parseJSON  = require('json-stream')
  , duplexify  = require('duplexify')
  , wbin       = require('windows-bin')
  , through2   = require('through2')
  , resolve    = require('path').resolve

function createStream (script, opts_) {
  var opts = opts_ || {}
  var duplex = duplexify.obj(null, null)

  function errback(err) {
    if (err) duplex.destroy(err)
  }

  // Find the cscript binary. If we're on 64-bit Windows and 32-bit
  // Node.js then prefer the native "Sysnative\cscript.exe", because
  // otherwise we would be redirected to "SysWow64\cscript.exe" and
  // then be unable to access the native registry (without resorting
  // to the slower ExecMethod). See also win-detect-browsers#18.
  wbin('cscript', { native: opts.native }, function(err, bin) {
    if (err) return duplex.destroy(err)

    var args = ['//Nologo', '//B', resolve(script)].concat(opts.args || [])
    var child = execFile(bin, args, errback)

    var input = child.stdin
    var output = child.stdout

    if (opts.wrap === 'json' || opts.json) {
      input = stringify()
      input.pipe(child.stdin)
      input.on('error', errback)
      output = output.pipe(parseJSON())
    }

    duplex.setReadable(output)
    duplex.setWritable(input)

    if (opts.debug) child.stderr.pipe(process.stderr)
    duplex.stderr = child.stderr
  })

  return duplex
}

function stringify() {
  // Push a newline *after* the JSON, or WScript.StdIn.ReadLine() will hang.
  return through2.obj(function(req, enc, next) {
    next(null, JSON.stringify(req) + '\r\n')
  })
}

module.exports = createStream
