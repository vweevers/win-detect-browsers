// Convenient access to environment variables
var env  = process.env
  , pf   = env['ProgramFiles(x86)'] || env['ProgramFiles']
  , pf64 = env.ProgramW6432 // "C:\Program Files" on x64
  , home = env.USERPROFILE || (env.HOMEDRIVE + env.HOMEPATH)

  // eg, "%USERPROFILE%\AppData\Local" or
  //     "%USERPROFILE%\Local Settings\Application Data" (XP)
  , local = env.LOCALAPPDATA || (home + '\\Local Settings\\Application Data')


// Export a list of common locations and 
// registry keys per browser.

module.exports = {
  default : {
    registry : [
      '"%s\\Software\\Classes\\http\\shell\\open\\command"'
    ],
    hives: ['HKEY_CURRENT_USER'] // we only want current user's default browser
  },
  chrome: {
    registry: [    // Expanded to HKEY_LOCAL_MACHINE and HKEY_CURRENT_USER
      '"%s\\Software\\Google\\Update" /v LastInstallerSuccessLaunchCmdLine',
      '"%s\\Software\\Wow6432Node\\Google\\Update" /v LastInstallerSuccessLaunchCmdLine',
      '"%s\\Software\\Clients\\StartMenuInternet\\Google Chrome\\shell\\open\\command"',
      '"%s\\SOFTWARE\\Wow6432Node\\Clients\\StartMenuInternet\\Google Chrome\\shell\\open\\command"',
      '"%s\\SOFTWARE\\Classes\\ChromeHTML\\shell\\open\\command"',

      // Parsing this seems to fail, needs testing
      '"%s\\SOFTWARE\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe"'
    ],
    locations: [   // Joined with filename (or [browsername].exe)
      [pf,         'Google\\Chrome\\Application'],
      [local,      'Google\\Chrome\\Application']
    ]
  },
  ff: {
    registry: [
      '"%s\\Software\\Clients\\StartMenuInternet\\FIREFOX.EXE\\shell\\open\\command"',
      '"%s\\Software\\Mozilla\\Mozilla Firefox\\" /s /v PathToExe',
      // First get version, then path
      [ '"%s\\Software\\Mozilla\\Mozilla Firefox" /v CurrentVersion',
        '"%s\\Software\\Mozilla\\Mozilla Firefox\\%s\\Main\\" /s /v PathToExe' ]
    ],
    file:          'firefox.exe',
    locations: [
      [pf,         'Mozilla Firefox']
    ]
  },
  ie: {
    registry: [
      '"%s\\Software\\Clients\\StartMenuInternet\\IEXPLORE.EXE\\shell\\open\\command"'
    ],
    file:          'iexplore.exe',
    locations: [
      [pf64,       'Internet Explorer'],
      [pf,         'Internet Explorer']
    ]
  },

  // Untested and incomplete (Safari for Windows is dead anyway)
  safari: {
    registry: [
      '"%s\\Software\\Apple Computer, Inc.\\Safari" /v BrowserExe'
    ]
  },

  opera: {
    registry: [
      '"%s\\Software\\Clients\\StartMenuInternet\\OperaStable\\shell\\open\\command"',
      '"%s\\Software\\Classes\\OperaStable\\shell\\open\\command"'
    ],
    file:          'Launcher.exe',
    locations: [
      [pf,         'Opera']
    ]
  }
}