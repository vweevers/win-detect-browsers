var debug      = require('debug')('win-detect-browsers')
  , script     = require('path').join(__dirname, 'main-dist.js')
  , cscript    = require('../cscript-stream')

module.exports = function() {
  var duplex = cscript(script, { json: true, debug: debug.enabled })
  duplex.on('error', debug) // Ignore errors
  return duplex;
}
