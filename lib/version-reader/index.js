var debug      = require('debug')('win-detect-browsers')
  , script     = require('path').join(__dirname, 'main-dist.js')
  , jscript    = require('jscript')

module.exports = function() {
  var duplex = jscript(script, { json: true, debug: debug.enabled })
  duplex.on('error', debug) // Ignore errors
  return duplex;
}
