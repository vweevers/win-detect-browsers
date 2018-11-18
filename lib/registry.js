'use strict'

const debug = require('debug')('win-detect-browsers')
const registry = process.platform === 'win32' ? require('registry-js') : tryRequire()

function tryRequire () {
  try {
    return require('registry-js')
  } catch (err) {
    debug(err)

    return {
      enumerateValues: function dummy () {
        return []
      }
    }
  }
}

const HKEY = registry.HKEY

const SHORT_HIVES = new Map([
  ['HKLM', HKEY.HKEY_LOCAL_MACHINE],
  ['HKCU', HKEY.HKEY_CURRENT_USER],
  ['HKCR', HKEY.HKEY_CLASSES_ROOT],
  ['HKCC', HKEY.HKEY_CURRENT_CONFIG],
  ['HKU', HKEY.HKEY_USERS]
])

exports.value = function (hive, key, valueName, callback) {
  if (typeof valueName === 'function') {
    // Get default value
    callback = valueName
    valueName = null
  }

  if (SHORT_HIVES.has(hive)) {
    var shortHive = hive
    hive = SHORT_HIVES.get(hive)
  }

  key = Array.isArray(key) ? key.join('\\') : key

  const result = registry.enumerateValues(hive, key)
  const expectedName = valueName || ''
  const fqk = [shortHive || hive, key].join('\\')

  for (let item of result) {
    if (!item) continue

    if (item.name === expectedName && item.type === 'REG_SZ') {
      return process.nextTick(callback, null, item.data, fqk)
    }
  }

  const err = new Error('not found')
  err.notFound = true
  process.nextTick(callback, err)
}

exports.values = function (hive, key, callback) {
  if (SHORT_HIVES.has(hive)) {
    hive = SHORT_HIVES.get(hive)
  }

  const result = registry.enumerateValues(hive, key)
  const obj = {}

  for (let item of result) {
    if (item) obj[item.name] = item.data
  }

  process.nextTick(callback, null, obj)
}
