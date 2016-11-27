var t = require('./types')

var HKEY_CLASSES_ROOT   = 0x80000000
  , HKEY_CURRENT_USER   = 0x80000001
  , HKEY_LOCAL_MACHINE  = 0x80000002
  , HKEY_USERS          = 0x80000003
  , HKEY_CURRENT_CONFIG = 0x80000005

var abbr =
  { HKCR: HKEY_CLASSES_ROOT
  , HKCU: HKEY_CURRENT_USER
  , HKLM: HKEY_LOCAL_MACHINE
  , HKU : HKEY_USERS
  , HKCC: HKEY_CURRENT_CONFIG }

var constants =
  { HKEY_CLASSES_ROOT  : HKEY_CLASSES_ROOT
  , HKEY_CURRENT_USER  : HKEY_CURRENT_USER
  , HKEY_LOCAL_MACHINE : HKEY_LOCAL_MACHINE
  , HKEY_USERS         : HKEY_USERS
  , HKEY_CURRENT_CONFIG: HKEY_CURRENT_CONFIG }

var inverse = {}

inverse[HKEY_CLASSES_ROOT]   = 'HKCR'
inverse[HKEY_CURRENT_USER]   = 'HKCU'
inverse[HKEY_LOCAL_MACHINE]  = 'HKLM'
inverse[HKEY_USERS]          = 'HKU'
inverse[HKEY_CURRENT_CONFIG] = 'HKCC'

var R = GetObject("winmgmts:\\root\\default:StdRegProv")

// Cache of parameter instances
var params = {}

function valid(output, hive, key, response) {
  if (typeof output === 'undefined') {
    response.error = 'Unknown error'
    return false
  }

  if (output.ReturnValue !== 0) {
    if (output.ReturnValue === 2) {
      response.error = 'Key not found: ' + inverse[hive] + '\\' + key
    }

    response.errno = output.ReturnValue
    return false
  }

  return true
}

exports.readKeys = function (hive, key, response) {
  var output = enumKey(hive, key)
  if (!valid(output, hive, key, response)) return
  response.keys = output.sNames != null ? output.sNames.toArray() : []
}

exports.readValues = function (hive, key, response) {
  var output = enumValues(hive, key)
  if (!valid(output, hive, key, response)) return

  // If only a default value is available
  if (output.sNames == null) {
    response.values = {}
    return
  }

  var names = output.sNames.toArray()
  var outTypes = output.Types.toArray()

  var result = {}
  var types = {}

  for(var i=0, l=names.length; i<l; i++) {
    var name = names[i]

    var type = outTypes[i]
    var op = get(t.getMethod(type), hive, key, name)
    if (!valid(op, hive, key + '#' + name, response)) return
    result[name] = op.sValue
    types[name] = type
  }

  response.types = types
  response.values = result
}

exports.readValue = function (hive, key, valueName, response) {
  var output = enumValues(hive, key)
  if (!valid(output, hive, key, response)) return

  // If only a default value is available
  if (output.sNames == null) return

  var names = output.sNames.toArray()
  var types = output.Types.toArray()

  for(var i=0, l=names.length; i<l; i++) {
    var name = names[i]

    if (name === valueName) {
      var op = get(t.getMethod(types[i]), hive, key, name)
      if (!valid(op, hive, key + '#' + name, response)) return
      response.value = op.sValue
      response.type = types[i]
      break
    }
  }
}

exports.readDefaultValue = function (hive, key, response) {
  var output = get('GetStringValue', hive, key, '')

  // When no default value is defined
  if (output && output.ReturnValue === 1) {
    response.defaultValue = null
    return
  }

  if (!valid(output, hive, key, response)) return
  response.defaultValue = output.sValue
}

exports.hive = function (hive) {
  hive = hive.toUpperCase()
  return abbr[hive] || constants[hive]
}

function enumValues(hive, key) {
  var method = 'EnumValues'
  var input = params[method] || (params[method] = par(method))

  input.hDefKey = hive
  input.sSubKeyName = key

  return R.ExecMethod_(method, input)
}

function enumKey(hive, key) {
  var method = 'EnumKey'
  var input = params[method] || (params[method] = par(method))

  input.hDefKey = hive
  input.sSubKeyName = key

  return R.ExecMethod_(method, input)
}

function get(method, hive, key, valueName) {
  var input = params[method] || (params[method] = par(method))

  input.hDefKey = hive
  input.sSubKeyName = key
  input.sValueName = valueName || ''

  return R.ExecMethod_(method, input)
}

function par(method) {
  var m = R.Methods_.Item(method)
  return m.InParameters.SpawnInstance_()
}
