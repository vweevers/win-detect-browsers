var spawn    = require('child_process').spawn
  , debug    = require('debug')('win-detect-browsers')
  , xtend    = require('xtend')
  , defaults = {
    // Forgot why or where this was necessary
    env: undefined,
    // WMIC creates a temporary file for some reason
    cwd: require('os').tmpdir(),
    windowsVerbatimArguments: true,
    stdio: [ 'ignore', 'pipe', 'ignore' ]
  }

// Asserts the command had output (after trimming) 
// and exit code was 0. Arguments are not escaped,
// unless opts.windowsVerbatimArguments == false.
module.exports = function (cmd, args, opts, cb) {
  if (typeof opts == 'function') cb = opts, opts = defaults
  else opts = xtend(defaults, opts)

  args = [args.join(' ')]

  function done(err, out) {
    if (!cb) return
    if (!err && !out) err = new Error('No output')

    cb(err, out)
    cb = null
  }

  var child = spawn(cmd, args, opts)
    , buffer = ''

  child.stdout.on('data', function(data){
    buffer+= data.toString()
  })

  child.on('error', done)
  child.on('close', function(code){
    if (code !== 0) {
      var err = new Error('Exited with code ' + code)
      err.code = code
      return done(err)
    }

    done(null, buffer.trim())
  })

  return child
}
