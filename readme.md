# win-detect-browsers

> Detects installed versions of Chrome, Chromium, Firefox, PhantomJS (local and global), Internet Explorer, Safari and Opera (Stable, Beta and Developer). Supports [Windows XP and up](https://github.com/vweevers/win-detect-browsers/wiki).

[![npm status](http://img.shields.io/npm/v/win-detect-browsers.svg?style=flat-square)](https://www.npmjs.org/package/win-detect-browsers) [![Build status](https://img.shields.io/appveyor/ci/vweevers/win-detect-browsers.svg?style=flat-square)](https://ci.appveyor.com/project/vweevers/win-detect-browsers) [![Dependency Status](https://img.shields.io/david/vweevers/win-detect-browsers.svg?style=flat-square)](https://david-dm.org/vweevers/win-detect-browsers)

## info

Returns the following information per browser:

- **name**: lowercase name
- **path**: absolute path to executable
- **version**: version number (`major.minor.patch.revision`)
- **channel**: channel name (Firefox and Opera only atm)
- **info**: additional version info (see `--verbose` example below)

## about

Basically, browser detection on Windows can't be done right. This is the *try-everything-and-fail-silently* approach. It accounts for architecture differences, normalizes environment variables, tries default locations, searches the registry (in the HKLM and HKCU hives), checks [Start Menu Internet Applications](http://msdn.microsoft.com/en-us/library/windows/desktop/dd203067(v=vs.85).aspx) and looks in `PATH`. Version numbers are then read from the executable metadata.

`browser-launcher` by substack has [poor Windows support](https://github.com/substack/browser-launcher/issues/7), and it prompted me to create this module. It is now used in [browser-launcher2](https://github.com/benderjs/browser-launcher2), an active fork of `browser-launcher`.

## cli

Install globally and run:

    npm i win-detect-browsers -g
    win-detect-browsers

Example output on Windows 8.1:

```
Found 13 browsers in 189ms

chrome 51.0.2692.0
  @ C:\Users\vweevers\AppData\Local\Google\Chrome SxS\Application\chrome.exe
chrome 49.0.2623.87
  @ C:\Program Files (x86)\Google\Chrome\Application\chrome.exe
chromium 51.0.2676.0
  @ C:\Users\vweevers\AppData\Local\Chromium\Application\chrome.exe
firefox 44.0.2.5884 (release)
  @ C:\Program Files (x86)\Mozilla Firefox\firefox.exe
firefox 46.0.0.5903 (developer)
  @ C:\Program Files (x86)\Firefox Developer Edition\firefox.exe
ie 11.0.9600.18124
  @ C:\Program Files (x86)\Internet Explorer\iexplore.exe
ie 11.0.9600.18123
  @ C:\Program Files\Internet Explorer\iexplore.exe
maxthon 4.9.1.1000
  @ C:\Program Files (x86)\Maxthon\Bin\Maxthon.exe
yandex 47.0.2526.6796
  @ C:\Users\vweevers\AppData\Local\Yandex\YandexBrowser\Application\browser.exe
phantomjs 1.9.8.0
  @ D:\Projecten\GitHub\win-detect-browsers\node_modules\phantomjs\lib\phantom\phantomjs.exe
opera 36.0.2130.32
  @ D:\bin\Opera\Stable\Launcher.exe
opera 36.0.2130.29
  @ D:\bin\Opera\Beta\Launcher.exe
opera 37.0.2171.0
  @ D:\bin\Opera\Developer\Launcher.exe
```

Enable debug with `SET DEBUG=win-detect-browsers`.

### examples

Show all available info on the first-found Chrome:

```
> win-detect-browsers --verbose --lucky chrome
Found 1 browsers in 25ms
{ name: 'chrome',
  path: 'C:\\Users\\vweevers\\AppData\\Local\\Google\\Chrome SxS\\Application\\chrome.exe',
  version: '51.0.2692.0',
  info:
   { FileVersion: '51.0.2692.0',
     CompanyName: 'Google Inc.',
     FileDescription: 'Google Chrome',
     InternalName: 'chrome_exe',
     LegalCopyright: 'Copyright 2015 Google Inc. All rights reserved.',
     OriginalFilename: 'chrome.exe',
     ProductName: 'Google Chrome',
     ProductVersion: '51.0.2692.0',
     CompanyShortName: 'Google',
     ProductShortName: 'Chrome',
     LastChange: '21ad7445a7f1b2dfa2e8ee6475594b9037b3c7c8-refs/heads/master@{#383454}',
     'Official Build': '1' } }
```

Detect Internet Explorer and Phantomjs:

```
> win-detect-browsers ie phantomjs
```

## API

- Streaming mode: `detect([names, options])` returns a readable stream.
- Error-first callback mode: `detect([names, options,] cb)` calls `cb` with an array of results.

Where `names` is an array of browser names you want to find. If omitted, it will detect all browsers. Available `options` are:

- `boolean lucky` whether to end the search for a browser after the first result. Note that this result is not consistent, because search is asynchronous. Defaults to `false`, meaning: find all versions.

## examples

Detect *[everything](http://youtu.be/k1yvvNvlXtg)*:

```js
var detect   = require('win-detect-browsers')
  , through2 = require('through2')

detect().pipe(through2.obj(function(b, _, next){
  var format = "\n%s %s\n  @ %s"
  console.log(format, b.name, b.version, b.path)
  next()
}))
```

Detect only Chrome and IE, using a callback:

```js
detect(['chrome', 'ie'], function (err, browsers) {
  console.log(browsers)
})
```

## Changelog

### 3.0.0

- Error-first callbacks: please use `cb(err, browsers)` instead of `cb(browsers)`
- Removed the `version` option.

### 2.0.0

- Speed improvement (2-4x), because it uses a single `cscript` process to query the registry (replaces `reg` queries) and a single `cscript` process to get the version numbers (replaces `wmic` queries).
- Exports a readable object stream, but 1.x callback style is still supported (at least until 3.0)
- Only emits executables (`*.exe`)
- No longer uses command-line version flags or version numbers found in the registry or elsewhere. This simplifies the process and makes the version numbers consistent and more detailed.

## License and credits

[MIT](http://opensource.org/licenses/MIT) © [Vincent Weevers](http://vincentweevers.nl). Registry stream adapted from [regedit](https://www.npmjs.com/package/regedit) © [ironSource](http://www.ironsrc.com/).
