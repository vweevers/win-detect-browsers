'use strict'

module.exports = function extractPath (str) {
  const m = /([a-z]:\\[^:\t"]+)/i.exec(str)
  return (m && m[1] && m[1].trim()) || null
}
