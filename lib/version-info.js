'use strict'

// Note: win-version-info internally has a `process.platform === 'win32'` check
// so it won't load its native addon on other platforms (good)
import vi from 'win-version-info'
import dbg from 'debug'

const debug = dbg('win-detect-browsers')

export default function annotate (b) {
  let info

  try {
    info = vi(b.path)
  } catch (err) {
    debug('%s: win-version-info failed for %s', b.name, b.path, err)
    return
  }

  const version = info.FileVersion || info.ProductVersion

  if (!version) {
    debug('%s: no version for %s', b.name, b.path)
    return
  }

  b.version = version
  b.info = info

  return b
}
