var spawn = require('child_process').spawn

// Asserts the command had output (after trimming) 
// and exit code was 0. Arguments are not escaped.
module.exports = function (cmd, args, cb) {
  args = [args.join(' ')]

  function done(err, out) {
    if (!cb) return

    if (!err && !out)
      err = new Error('No output')

    cb(err, out)
    cb = null
  }

  var child = spawn(cmd, args, {
    cwd: undefined, env: undefined,
    windowsVerbatimArguments: true,
    stdio: [ 'ignore', 'pipe', 'ignore' ]
  })

  var buffer = ''
  child.stdout.on('data', function(data){
    buffer+= data.toString()
  })

  child.on('error', done)
  child.on('close', function(code){
    if (code !== 0)
      done(new Error('Exited with code ' + code))
    else
      done(null, buffer.trim())
  })
}
