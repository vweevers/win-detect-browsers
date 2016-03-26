var debug      = require('debug')('reg-stream')
  , script     = require('path').join(__dirname, 'main-dist.js')
  , wmi        = require('wmi-errors')
  , t          = require('./types')
  , jscript    = require('jscript')

function createStream () {
  var duplex = jscript(script, { json: true, debug: debug.enabled })
  duplex.on('error', debug) // Ignore errors
  return duplex;
}

module.exports = function() {
  var pending = []
  var seq = 0
  var stream = createStream()
    .on('close', finish).on('finish', finish)

  function finish(){
    pending = pending.filter(function(request){
      request.cb(new Error('Stream ended'))
      return false
    })
  }

  stream.on('data', function(response){
    debug('response', response)

    while(pending.length) {
      var request = pending.shift()

      if (response.id === request.id) {
        if (response.error || response.errno) {
          request.cb(new wmi.Error(response.error, response.errno))
        } else {
          if (response.value != null) {
            var value = t.coerce(response.type, response.value)
            request.cb(null, value, request.key)
          } else {
            request.cb(null, response.defaultValue, request.key)
          }
        }

        break
      } else {
        request.cb(new Error('Out of order or invalid response'))
      }
    }
  })

  stream.query = function (key, valueName, cb) {
    if (!key) return cb(new Error('key is empty'))
    if (typeof key !== 'string') key = key.join('\\')

    var id = ++seq

    // Normalize and deduce hive and sub key
    var a = key.split(/[/\\]+/)

    var request = {
      hive: a[0],
      key: a.slice(1).join('\\'),
      id: id,
      cb: cb
    }

    // If valueName is empty, return key's default value
    // TODO: refactor upstream
    if (valueName) request.value = valueName
    else request.defaultValue = true

    debug('request', request)
    pending.push(request)
    stream.write(request)
  }

  return stream;
}
