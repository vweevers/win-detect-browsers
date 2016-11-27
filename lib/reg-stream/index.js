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

module.exports = function () {
  var pending = []
  var seq = 0
  var stream = createStream()
    .on('close', finish).on('end', finish)

  function finish(){
    pending = pending.filter(function (request){
      request.cb(new Error('Stream ended'))
      return false
    })
  }

  stream.on('data', function (response){
    while(pending.length) {
      var request = pending.shift()

      if (response.id === request.id) {
        debug('response for %s', request.key, response)

        if (response.errno === 2) {
          const err = new Error(response.error)
          err.notFound = true
          request.cb(err)
        } else if (response.error || response.errno) {
          request.cb(new wmi.Error(response.error, response.errno))
        } else if (request.simple) {
          // TODO: coerce all, move transf to fns below, rm .simple
          if (response.value != null) {
            var value = t.coerce(response.type, response.value)
            request.cb(null, value, request.key)
          } else {
            request.cb(null, response.defaultValue, request.key)
          }
        } else {
          request.cb(null, response, request.key)
        }

        break
      } else {
        request.cb(new Error('Out of order or invalid response'))
      }
    }
  })

  function getAll(key, cb) {
    makeRequest({ key: key, keys: true, values: true, defaultValue: true }, cb)
  }

  function getKeys(key, filter, cb) {
    if (typeof filter === 'function') cb = filter, filter = null
    else if (typeof filter === 'string') filter = [filter]

    makeRequest({ key: key, keys: true }, function (err, res) {
      if (err) cb(err, res)
      else cb(null, !filter ? res.keys : res.keys.filter(function (key) {
        return filter.indexOf(key) >= 0
      }))
    })
  }

  function getValue(key, valueName, cb) {
    if (typeof valueName === 'function') cb = valueName, valueName = null

    var request = { key: key, simple: true }

    // If valueName is empty, return key's default value
    if (valueName) request.value = valueName
    else request.defaultValue = true

    makeRequest(request, cb)
  }

  // TODO: filter and return res.values
  function getValues(key, filter, cb) {
    if (typeof filter === 'function') cb = filter, filter = true
    makeRequest({ key: key, values: filter, defaultValue: filter === true }, cb)
  }

  function makeRequest(request, cb) {
    var key = request.key

    if (!key) return cb(new Error('key is empty'))
    if (typeof key !== 'string') key = key.join('\\')

    // Normalize and deduce hive and sub key
    var a = key.split(/[/\\]+/)

    request.hive = a[0]
    request.key = a.slice(1).join('\\')
    request.id = ++seq
    request.cb = cb

    // debug('request', request)
    pending.push(request)
    stream.write(request)
  }

  var wrapper = {
    getValue: getValue,
    getDefaultValue: getValue,
    getValues: getValues,
    getKeys: getKeys,
    get: getAll,
    request: makeRequest,
    end: stream.end.bind(stream),
    stream: stream
  }

  // Backwards compatibility
  wrapper.query = wrapper.getValue

  return wrapper;
}
