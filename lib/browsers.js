var path       = require('path')
  , pathExists = require('path-exists')
  , debug      = require('debug')('win-detect-browsers')

exports.chrome = {
  find: function() {
    // Joined with filename (or [browser name].exe)
    this.dir('LOCALAPPDATA', 'Google\\Chrome\\Application')

    // Chrome Canary
    this.dir('LOCALAPPDATA', 'Google\\Chrome SxS\\Application')

    // programFiles() is a shortcut to dir() that checks both
    // "Program Files" and "Program Files (x86)" if on 64-bit Windows
    this.programFiles('Google\\Chrome\\Application')

    // Expanded to HKEY_LOCAL_MACHINE\Software, HKEY_CURRENT_USER\Software
    // and if on a x64 machine, their 32-bit (Software\WoW6432) counterparts.
    // Should also find 64-bit Chrome if installed, because 32-bit Chrome 
    // uses the 32-bit registry and 64-bit Chrome uses the regular registry, 
    // with the same subkeys.
    this.registry('Google\\Update', 'LastInstallerSuccessLaunchCmdLine')
    this.registry('Classes\\ChromeHTML\\shell\\open\\command')
    
    // Note: this one returns the binary's parent path
    this.registry('Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe', null, true)

    this.startMenu('Google Chrome')
    this.inPath()
    this.env('CHROME_BIN')
  }
}

exports.chromium = {
  bin: 'chrome.exe',

  // Can't search for chromium in PATH, because the binary name conflicts with chrome
  find: function() {
    this.dir('LOCALAPPDATA', 'Chromium\\Application')
    this.registry('Chromium', 'InstallerSuccessLaunchCmdLine')
    this.env('CHROMIUM_BIN')
  }
}

exports.firefox = {
  find: function() {
    this.programFiles('Mozilla Firefox')
    
    this.startMenu()
    this.registry('Mozilla\\Mozilla Firefox', 'PathToExe')
    
    this.versionRegistry(
      // First get version, then path
      'Mozilla\\Mozilla Firefox', 'CurrentVersion',
      'Mozilla\\Mozilla Firefox\\%s\\Main', 'PathToExe'
    );

    this.inPath()
  }
}

exports.ie = { 
  bin: 'iexplore.exe',
  find: function() {
    this.programFiles('Internet Explorer')
    this.startMenu()
    this.inPath()
  }
}

exports.phantomjs = {
  // Without .exe suffix, so phantomjs.cmd can be found in PATH
  bin: 'phantomjs',

  find: function() {
    this.file(process.cwd()+'\\node_modules\\.bin\\phantomjs.cmd')
    this.inPath()
    this.env('PHANTOMJS_BIN')
  },

  transform: function (file, done, _noRecursion) {
    if (!isCmd(file)) return done(file)

    // If installed by nodejs module, we can get the executable
    // path from the module. The module also provides a
    // version number, but we ignore that to keep things simple.

    var mod = 'node_modules/phantomjs/lib/phantomjs.js'
      , local = path.resolve(file, '../../..', mod)
      , finder = this

    pathExists(local, function(err, exists){
      if (exists) return getBinary(local)

      var global = path.resolve(file, '..', mod)

      pathExists(global, function(err, exists){
        if (exists) return getBinary(global)
        debug('Could not resolve "%s" to module', file)
        done()
      })
    })

    function isCmd(path) {
      return path.slice(-4).toLowerCase()==='.cmd'
    }

    function getBinary(mod) {
      var path = require(mod).path
      
      // a local module can point to global installation
      if (isCmd(path)) {
        if (_noRecursion) return done()
        return finder.transform(path, done, true);
      }

      done(path)
    }
  }
}

exports.opera = {
  bin: 'Launcher.exe',
  find: function() {
    this.programFiles('Opera')
    this.registry('Clients\\StartMenuInternet\\OperaStable\\shell\\open\\command')
    this.registry('Classes\\OperaStable\\shell\\open\\command')

    this.programFiles('Opera beta')
    this.registry('Clients\\StartMenuInternet\\OperaBeta\\shell\\open\\command')
    this.registry('Classes\\OperaBeta\\shell\\open\\command')

    this.programFiles('Opera developer')
    this.registry('Clients\\StartMenuInternet\\OperaDeveloper\\shell\\open\\command')
    this.registry('Classes\\OperaDeveloper\\shell\\open\\command')
  
    this.inPath()
  }
}

// Incomplete (Safari for Windows is dead anyway)
exports.safari = {
  find: function() {
    this.startMenu()
    this.registry('Apple Computer, Inc.\\Safari', 'BrowserExe')
    this.inPath()
  }
}
