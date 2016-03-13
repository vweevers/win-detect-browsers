var JSON = require('json3')
var fs = new ActiveXObject('Scripting.FileSystemObject')

function getVersion(path) {
  if (!path) {
    WScript.StdErr.WriteLine('Path is empty')
    return null
  }

  if (fs.FileExists(path)) {
    var v = fs.GetFileVersion(path)
    if (!v) WScript.StdErr.WriteLine('No version information available for ' + path)
    return v || null
  } else {
    WScript.StdErr.WriteLine('Path doesn\'t exist: ' + path)
    return null
  }
}

while(!WScript.StdIn.AtEndOfStream) {
  var entry = JSON.parse(WScript.StdIn.ReadLine())
  entry.version = getVersion(entry.path)

  // Don't use WriteLine, json-stream doesn't like CRLF
  WScript.StdOut.Write(JSON.stringify(entry) + '\n')
}
