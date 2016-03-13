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
  var browser = JSON.parse(WScript.StdIn.ReadLine())
  browser.version = getVersion(browser.path)
  WScript.StdOut.WriteLine(JSON.stringify(browser))
}
