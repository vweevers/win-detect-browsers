var debug      = require('debug')('win-detect-browsers')
  , execFile   = require('child_process').execFile
  , JSONStream = require('JSONStream')
  , duplexify  = require('duplexify')
  , script     = require('path').join(__dirname, 'main-dist.js')
  , wbin       = require('windows-bin')
  , WIN_EOL    = '\r\n'

module.exports = function() {
  debug('create version stream')

  var duplex = duplexify.obj(null, null)

  wbin('cscript', function(err, bin){
    if (err) return duplex.destroy(err)

    var child = execFile(bin, ['//Nologo', '//B', script], function done(err) {
      if (err) duplex.destroy(err)
    })

    var output = child.stdout.pipe(JSONStream.parse())
    var input = JSONStream.stringify('', WIN_EOL, WIN_EOL)

    child.stderr.pipe(process.stderr)
    input.pipe(child.stdin)

    duplex.setReadable(output)
    duplex.setWritable(input)
  })

  // Errors from input and output bubble to duplex
  duplex.on('error', debug)

  return duplex;
}
