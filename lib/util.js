var WIN_EOL = '\r\n'

if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
  };
}

console = {
  log: function(message) {
    WScript.StdOut.Write(message + WIN_EOL)
  },

  error: function(message) {
    WScript.StdErr.Write(message + WIN_EOL)
  }
}
