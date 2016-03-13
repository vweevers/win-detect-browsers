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
          // Read all if keys === true, else treat as array of names
          reg.readKeys(hive, key, request.keys, response)
        }

        if (request.values) {
          // Read all if values === true, else treat as array of names
          reg.readValues(hive, key, request.values, response)
        } else if (request.value) {
          // Read a single value
          reg.readValue(hive, key, request.value, response)
        }

        if (request.defaultValue) {
          reg.readDefaultValue(hive, key, response)
        }
      } catch (err) {
        response.error = err.message
      }
    }
  }

  WScript.StdOut.WriteLine(JSON.stringify(response))
}
