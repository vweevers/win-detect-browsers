Set stdout = WScript.StdOut
Set stderr = WScript.StdErr
Set stdin = WScript.StdIn

Sub WriteErr(message)
  stderr.Write message
End Sub

Sub Write(message)
  stdout.Write message
End Sub

Function JsonSafe(outStrText)
  If outStrText = "" Then
    JsonSafe = ""
    Exit Function 
  End If
  
  ' different from normal JsonSafe, here we also escape the newline
  ' since it is used as separator when writing results to stdout

  outStrText = Replace(outStrText, "\", "\\")
  outStrText = Replace(outStrText, vbcrlf, "\\r\\n")  
  outStrText = Replace(outStrText, """", "\""") 
  outStrText = UnicodeJSON(outStrText)
  JsonSafe = outStrText
End Function

Function UnicodeJSON(astr)
  If isNull(astr) Then
    UnicodeJSON = ""
    Exit Function
  End If

  Dim c 
  Dim utftext: utftext = ""
  
  For n = 1 To Len(astr)
    c = CLng(AscW(Mid(astr, n, 1)))

    If c < 0 Then
      c = &H10000 + c
    End If

    If c < &H80 Then
      utftext = utftext & Mid(astr, n, 1)
    ElseIf c < &H100 Then
      utftext = utftext & "\u00" & Hex(c)
    ElseIf c < &H1000 Then
      utftext = utftext & "\u0" & Hex(c)
    Else
      utftext = utftext & "\u" & Hex(c)
    End If
  Next

  UnicodeJSON = utftext
End Function
