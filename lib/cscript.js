var env      = require('./env')
  , path     = require('path')
  , which    = require('which')
  , exists   = require('path-exists')
  , debug    = require('debug')('win-detect-browsers')
  , waiting
  , result

// Find the cscript binary. If we're on 64-bit Windows 
// prefer the native "%SystemRoot%\Sysnative\cscript.exe",
// because if nodejs is 32-bit we would be redirected to 
// "%SystemRoot%\SysWow64\cscript.exe" and then be unable
// to access the native registry (without resorting to the
// slower ExecMethod). See also #18 on GitHub.
module.exports = function(cb) {
  // Search was completed earlier.
  if (result != null) return setImmediate(emit.bind(null, cb))

  // Search has already started
  if (waiting != null) return waiting.push(cb)

  waiting = [cb]

  // Usually "C:\Windows". Prefer SYSTEMROOT over WINDIR, 
  // because SYSTEMROOT is a read-only built-in variable.
  var root = env.SYSTEMROOT
  var def  = path.join(root, 'system32\\cscript.exe')

  if (env.X64) find(path.join(root, 'Sysnative\\cscript.exe'), def)
  else find(def)

  function find(bin, alt) {
    exists(bin, function(err, exists){
      if (exists) done(null, bin)
      else if (alt) find(alt)
      else which('cscript', done)
    })
  }

  function done(err, bin) {
    debug(err || ('Found cscript: ' + bin))
    result = [err, bin]
    waiting.forEach(emit)
    waiting = null
  }

  function emit(cb) {
    cb.apply(null, result)
  }
}
