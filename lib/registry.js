// Note: registry-js internally has a `process.platform === 'win32'` check so it
// won't load its native addon on other platforms (good)
import * as registry from 'registry-js'

const HKEY = registry.HKEY
const SHORT_HIVES = new Map([
  ['HKLM', HKEY.HKEY_LOCAL_MACHINE],
  ['HKCU', HKEY.HKEY_CURRENT_USER],
  ['HKCR', HKEY.HKEY_CLASSES_ROOT],
  ['HKCC', HKEY.HKEY_CURRENT_CONFIG],
  ['HKU', HKEY.HKEY_USERS]
])

// TODO: refactor
const api = {}

api.value = function (hive, key, valueName, callback) {
  if (typeof valueName === 'function') {
    // Get default value
    callback = valueName
    valueName = null
  }

  let shortHive

  if (SHORT_HIVES.has(hive)) {
    shortHive = hive
    hive = SHORT_HIVES.get(hive)
  }

  key = Array.isArray(key) ? key.join('\\') : key

  const result = registry.enumerateValuesSafe(hive, key)
  const expectedName = valueName || ''
  const fqk = [shortHive || hive, key].join('\\')

  for (const item of result) {
    if (!item) continue

    if (item.name === expectedName && item.type === 'REG_SZ') {
      return process.nextTick(callback, null, item.data, fqk)
    }
  }

  const err = new Error('not found')
  err.notFound = true
  process.nextTick(callback, err)
}

api.values = function (hive, key, callback) {
  if (SHORT_HIVES.has(hive)) {
    hive = SHORT_HIVES.get(hive)
  }

  const result = registry.enumerateValuesSafe(hive, key)
  const obj = {}

  for (const item of result) {
    if (item) obj[item.name] = item.data
  }

  process.nextTick(callback, null, obj)
}

export default api
