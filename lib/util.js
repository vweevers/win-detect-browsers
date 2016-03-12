// Polyfills
global.JSON = require('json3')

if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
  };
}

// Simple console
var WIN_EOL = '\r\n'

console = {
  log: function(message) {
    WScript.StdOut.Write(message + WIN_EOL)
  },

  error: function(message) {
    WScript.StdErr.Write(message + WIN_EOL)
  }
}
