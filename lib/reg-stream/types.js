// Shared code between Node and JScript

var REG_SZ        = 1
  , REG_EXPAND_SZ = 2
  , REG_BINARY    = 3
  , REG_DWORD     = 4
  , REG_MULTI_SZ  = 7
  , REG_QWORD     = 11

exports.getMethod = function (type) {
  switch(type) {
    case REG_SZ:
      return 'GetStringValue'
    case REG_EXPAND_SZ:
      return 'GetExpandedStringValue'
    case REG_BINARY:
      return 'GetBinaryValue'
    case REG_DWORD:
      return 'GetDWORDValue'
    case REG_MULTI_SZ:
      return 'GetMultiStringValue'
    case REG_QWORD:
      return 'GetQWORDValue'
    default:
      throw new Error('Unsupported type: ' + type)
  }
}

exports.coerce = function (type, value) {
  if (type === REG_BINARY) {
    return Buffer(value)
  }

  return value
}
