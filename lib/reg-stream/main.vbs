Function Main()
  Do While Not stdin.AtEndOfLine
    strLine = stdin.ReadLine()
    strLine = unescape(trim(strLine))

    ParseHiveAndSubKey strLine, strKey, constHive, strSubKey, strValueName

    Write "{ ""key"" : """ & JsonSafe(strKey) & """, ""name"": """
    Write JsonSafe(strValueName) & """, ""data"": "

    if IsNull(constHive) Then
      Write "null"  ' Unsupported hive
    Else
      WriteValue constHive, strSubKey, strValueName
    End If

    Write "}" & vbcrlf
  Loop
End Function
