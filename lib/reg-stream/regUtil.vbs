' Note: TODO's and most other comments are by regedit author

' TODO: consider incorporating a json writer of some sort instead of adhoc solution like the following
' e.g: http://demon.tw/my-work/vbs-json.html

const HKEY_CLASSES_ROOT = &H80000000
const HKEY_CURRENT_USER = &H80000001
const HKEY_LOCAL_MACHINE = &H80000002
const HKEY_USERS = &H80000003
const HKEY_CURRENT_CONFIG = &H80000005

' render the child of a sub path strSubKey in hive constHive
' as json.
Sub WriteValue(constHive, strSubKey, strValueName)
  Dim err: err = EnumValues (constHive, strSubKey, arrValueNames, arrValueTypes)

  If err <> 0 Then
    Write "null"
    Exit Sub
  End If

  If Not IsNull(arrValueNames) Then
    For y = 0 To UBound(arrValueNames)
      If arrValueNames(y) = strValueName Then
        intValueType = arrValueTypes(y)

        ' assign the value to varValue
        GetValueByType constHive, strSubKey, strValueName, intValueType, varValue

        Write RenderValueByType(intValueType, varValue)
        Exit Sub
      End If
    Next
  ElseIf Len(strValueName) = 0 Then
    ' fix for keys with only default values in them
    ' see http://stackoverflow.com/questions/8840343/how-to-read-the-default-value-from-registry-in-vbscript
    GetStringValue constHive, strSubKey, "", strDefaultValue

    If IsNull(strDefaultValue) = false and strDefaultValue <> "" Then
      ' write the default value with REG_SZ
      Write RenderValueByType(1, strDefaultValue)
      Exit Sub
    End If
  End If

  Write "null"
End Sub

' given a request like "HKLM\subkey[TAB]valueName"
' return the key, hive constant, subkey and valueName
Sub ParseHiveAndSubKey(strRawKey, outStrKey, outConstHive, outStrSubKey, outStrValueName)
  ' split into two parts to deduce the valuename
  a1 = Split(strRawKey, vbtab, 2, 1)
  
  If UBound(a1) > 0 Then
    outStrKey = a1(0)  
    outStrValueName = a1(1)
  Else
    outStrKey = strRawKey
    outStrValueName = ""
  End If

  ' split into two parts to deduce the hive and the sub key
  a2 = Split(outStrKey, "\", 2, 1)

  If UBound(a2) > 0 Then
    strHive = a2(0)
    outStrSubKey = a2(1)
  Else
    strHive = strRawKey
    outStrSubKey = ""
  End If

  outConstHive = StringToHiveConst(UCase(strHive))
End Sub

Function StringToHiveConst(strHive)
  Select Case strHive
    Case "HKCR"
      StringToHiveConst = HKEY_CLASSES_ROOT
    Case "HKCU"
      StringToHiveConst = HKEY_CURRENT_USER
    Case "HKLM"
      StringToHiveConst = HKEY_LOCAL_MACHINE
    Case "HKU"
      StringToHiveConst = HKEY_USERS
    Case "HKCC"
      StringToHiveConst = HKEY_CURRENT_CONFIG
    Case Else
      StringToHiveConst = Null
  End Select
End Function

' render by value type:
' string will return as a string with double quotes, e.g "value"
' multi string values which return as an array ot strings "["1", "2"]" (double quotes included ofc)
' numeric values like DWORD and QWORD just return as the number e.g. 1
' byte arrays such as reg_binary return as an array of ints, e.g [1,2,3]
Function RenderValueByType(intType, varValue)
  Select Case intType
    ' REG_SZ
    Case 1
      RenderValueByType = """" & JsonSafe(varValue) & """"
    ' REG_EXPAND_SZ
    Case 2
      RenderValueByType = """" & JsonSafe(varValue) & """"
    ' REG_BINARY
    Case 3
      RenderValueByType = RenderByteArray(varValue)
    ' REG_DWORD
    Case 4
      RenderValueByType= varValue
    ' REG_MULYI_SZ'
    Case 7
      RenderValueByType = RenderStringArray(varValue)
    ' REG_QWORD
    Case 11
      RenderValueByType = varValue
    Case Else
      WriteErr("invalid Registry Value Type " & intType)
      RenderValueByType = ""
  End Select
End Function

' get the value of a registry based on its value type and assign it to out parameter outVarValue
Sub GetValueByType(constHive, strKey, strValueName, intType, outVarValue)
  Select Case intType
    ' REG_SZ
    Case 1
      GetStringValue constHive, strKey, strValueName, outVarValue
      Exit Sub
    ' REG_EXPAND_SZ
    Case 2
      GetExpandedStringValue constHive, strKey, strValueName, outVarValue
      Exit Sub
    ' REG_BINARY
    Case 3
      GetBinaryValue constHive, strKey, strValueName, outVarValue
      Exit Sub
    ' REG_DWORD
    Case 4
      GetDWORDValue constHive, strKey, strValueName, outVarValue
      Exit Sub
    ' REG_MULYI_SZ'
    Case 7
      GetMultiStringValue constHive, strKey, strValueName, outVarValue
      Exit Sub
    ' REG_QWORD
    Case 11
      GetQWORDValue constHive, strKey, strValueName, outVarValue
      Exit Sub
    Case Else
      outVarValue = null
  End Select
End Sub

' render a byte array as a json array of numbers
Function RenderByteArray(arr)
  RenderByteArray = "[]"

  If Not IsNull(arr) Then
    RenderByteArray = "[" & Join(arr, ",") & "]"
  End If
End Function

' render a string array as json string array
Function RenderStringArray(arr)
  Result = "["
  If Not IsNull(arr) Then
    For t = 0 To UBound(arr)
      If (t > 0) Then
        Result = Result &  ","
      End If

      Result = Result & """" & JsonSafe(arr(t)) & """"
    Next
  End If
  Result = Result & "]"

  RenderStringArray = Result
End Function

Function ToBinaryValue(strValue)
  arrValue = Split(strValue, ",")

  If IsNull(arrValue) Then
    ToBinaryValue = Array()
    Exit Function
  End If

  For i = 0 To UBound(arrValue)
    arrValue(i) = CInt(arrValue(i))
  Next

  ToBinaryValue = arrValue
End Function
