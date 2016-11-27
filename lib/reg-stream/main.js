var JSON = require('json3')
var reg = require('./reg')

while(!WScript.StdIn.AtEndOfStream) {
  var request = JSON.parse(WScript.StdIn.ReadLine())
  var response = { id: request.id }

  if (typeof request !== 'object') {
    response.error = 'Empty or invalid request'
  } else {
    var hive = reg.hive(request.hive)
      , key = request.key

    if (!hive) {
      response.error = 'Unsupported or empty hive'
    } else {
      try {
        if (request.keys) {
          reg.readKeys(hive, key, response)
        }

        if (request.values) {
          reg.readValues(hive, key, response)
        } else if (request.value) {
          // Read a single value
          reg.readValue(hive, key, request.value, response)
        }

        if (request.defaultValue) {
          reg.readDefaultValue(hive, key, response)
        }
      } catch (err) {
        response.error = err.message || String(err)
      }
    }
  }

  // Don't use WriteLine, json-stream doesn't like CRLF
  WScript.StdOut.Write(JSON.stringify(response) + '\n')
}
