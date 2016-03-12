// maybe also do https://babeljs.io/docs/plugins/transform-jscript/

require('../util')

var fs = new ActiveXObject('Scripting.FileSystemObject')

function getVersion(path) {
  if (!path) {
    console.error('Path is empty')
    return null
  }

  if (fs.FileExists(path)) {
    var v = fs.GetFileVersion(path)
    if (!v) console.error('No version information available for ' + path)
    return v || null
  } else {
    console.error('Path doesn\'t exist: ' + path)
    return null
  }
}

while(!WScript.StdIn.AtEndOfLine) {
  try {
    var req = JSON.parse(WScript.StdIn.ReadLine()) || {}
  } catch (err) {
    req = {}
  }

  console.log(JSON.stringify({
    name: req.name,
    path: req.path,
    version: getVersion(req.path)
  }))
}
