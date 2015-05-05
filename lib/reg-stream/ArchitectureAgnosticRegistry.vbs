Set private_oReg = GetObject("winmgmts:\root\default:StdRegProv")

Sub GetStringValue(constHive, strKey, strValueName, strValue)
  private_oReg.GetStringValue constHive, strKey, strValueName, strValue
End Sub

Sub GetExpandedStringValue(constHive, strKey, strValueName, strValue)
  private_oReg.GetExpandedStringValue constHive, strKey, strValueName, strValue
End Sub

Sub GetMultiStringValue(constHive, strKey, strValueName, arrStrValue)
  private_oReg.GetMultiStringValue constHive, strKey, strValueName, arrStrValue
End Sub 

Sub GetDWORDValue(constHive, strKey, strValueName, intDWordValue)
  private_oReg.GetDWORDValue constHive, strKey, strValueName, intDWordValue
End Sub

Sub GetQWORDValue(constHive, strKey, strValueName, intQWordValue)
  private_oReg.GetQWORDValue constHive, strKey, strValueName, intQWordValue
End Sub

Sub GetBinaryValue(constHive, strKey, strValueName, arrBinaryValue)
  private_oReg.GetBinaryValue constHive, strKey, strValueName, arrBinaryValue
End Sub

Function EnumKey(constHive, strSubKey, arrKeyNames)
  EnumKey = private_oReg.EnumKey(constHive, strSubKey, arrKeyNames)
End Function

Function EnumValues(constHive, strSubKey, arrValueNames, arrValueTypes)
  EnumValues = private_oReg.EnumValues(constHive, strSubKey, arrValueNames, arrValueTypes)
End Function
