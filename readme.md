# win-detect-browsers

**Fast and native browser detection on Windows. Detects installed versions of [Beaker](https://beakerbrowser.com/), [Brave](https://brave.com/), [Chrome](https://www.google.com/chrome/), [Chromium](https://www.chromium.org/), [Firefox](https://www.mozilla.org/en-US/firefox/), [Internet Explorer](https://en.wikipedia.org/wiki/Internet_Explorer), [Maxthon](http://www.maxthon.com/), [Opera](https://www.opera.com/), [Safari](https://www.apple.com/safari/) and [Yandex](https://browser.yandex.com/).**

[![npm status](http://img.shields.io/npm/v/win-detect-browsers.svg)](https://www.npmjs.org/package/win-detect-browsers)
[![Build status](https://img.shields.io/appveyor/ci/vweevers/win-detect-browsers.svg)](https://ci.appveyor.com/project/vweevers/win-detect-browsers)
[![Dependency Status](https://img.shields.io/david/vweevers/win-detect-browsers.svg)](https://david-dm.org/vweevers/win-detect-browsers)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Table of Contents

<details><summary>Click to expand</summary>

- [Usage](#usage)
- [API](#api)
- [CLI](#cli)
- [Install](#install)
- [Background](#background)
- [License](#license)

</details>

## Usage

**If you are upgrading:** please see [the changelog](CHANGELOG.md).

```js
const detect = require('win-detect-browsers')

// All browsers
detect(function (err, browsers) {
  if (err) throw err
  console.log(browsers)
})

// Chrome and Firefox
detect(['chrome', 'firefox'], function (err, browsers) {
  if (err) throw err

  for (let b of browsers) {
    console.log(b.version) // '57.0.2931.0'
    console.log(b.channel) // 'canary'
  }
})
```

## API

### `detect([names, ]callback)`

`names` is an array of browser names you want to find. If omitted or empty, it will detect _[everything](http://youtu.be/k1yvvNvlXtg)_. The `callback` receives an error if any and an array of `results`. A result is excluded if its path has no `.exe` extension or if its version could not be read.

Each `result` is an object with the following properties:

- `name` (string): `chrome`, `chromium`, `firefox`, `ie`, `safari`, `opera`, `maxthon` or `yandex`
- `path` (string): absolute path to executable
- `version` (string)
- `arch` (string): CPU type the executable was built for: `amd64`, `i386` or [other](https://github.com/vweevers/pe-machine-type#types);
- `info` (object): executable metadata (see [full sample](#full-sample) below).

Additional properties are usually available but not guaranteed:

- `channel` (string):
  - Chrome: `stable`, `canary`, `beta` or `dev`
  - Firefox: `release`, `developer`, `nightly` or [`esr`](https://www.mozilla.org/en-US/firefox/organizations/faq/)
  - Older versions of Firefox: `aurora`, `beta` or `rc`;
  - Opera: `stable`, `beta` or `developer`.
- `uninstall` (object): Chrome only. Uninstaller info with:
  - `path` (string): path to installer;
  - `arguments` (array): arguments to installer in order to uninstall.
- `bitness` (number): Chrome only. 64 or 32.
- `guid` (string): Chrome only.

## CLI

```
win-detect-browsers [options] [name, name..]
```

Options:

- `--help` `-h`: Show help
- `--version` `-v`: Show CLI version number
- `--json` `-j`: Print results as JSON array
- `--summary` `-s`: Less properties;
- `--debug` `-d`: Enable [debug](https://github.com/visionmedia/debug) scope.

### Sample

On Windows 10 with `--summary`:

<details><summary>Click to expand</summary>

```
IE 11 64-bit
├── Path:    C:\Program Files\Internet Explorer\iexplore.exe
└── Version: 11.0.17134.1

IE 11 32-bit
├── Path:    C:\Program Files (x86)\Internet Explorer\iexplore.exe
└── Version: 11.0.17134.1

CHROME 68 CANARY 64-bit
├── Path:    C:\Users\vweevers\AppData\Local\Google\Chrome SxS\Application\chrome.exe
├── Version: 68.0.3436.0
└── GUID:    4EA16AC7-FD5A-47C3-875B-DBF4A2008C20

CHROME 66 STABLE 64-bit
├── Path:    C:\Program Files (x86)\Google\Chrome\Application\chrome.exe
├── Version: 66.0.3359.181
└── GUID:    8A69D345-D564-463C-AFF1-A69D9E530F96

FIREFOX 61 RELEASE 64-bit
├── Path:    C:\Program Files\Mozilla Firefox\firefox.exe
└── Version: 61.0.0.6711

FIREFOX 62 NIGHTLY 64-bit
├── Path:    C:\Program Files\Firefox Nightly\firefox.exe
└── Version: 62.0.0.6712

FIREFOX 61 DEVELOPER 64-bit
├── Path:    C:\Program Files\Firefox Developer Edition\firefox.exe
└── Version: 61.0.0.6711

OPERA 53 BETA 64-bit
├── Path:    C:\Program Files\Opera beta\Launcher.exe
└── Version: 53.0.2907.31

Found 9 browsers in 26 ways within 76ms.
```

</details>

### Full Sample

On Windows 10 with `--json`:

<details><summary>Click to expand</summary>

```json
[
  {
    "name": "ie",
    "path": "C:\\Program Files\\Internet Explorer\\iexplore.exe",
    "version": "11.0.17134.1",
    "arch": "amd64",
    "info": {
      "FileVersion": "11.0.17134.1",
      "CompanyName": "Microsoft Corporation",
      "FileDescription": "Internet Explorer",
      "InternalName": "iexplore",
      "LegalCopyright": "© Microsoft Corporation. Alle rechten voorbehouden.",
      "OriginalFilename": "IEXPLORE.EXE.MUI",
      "ProductName": "Internet Explorer",
      "ProductVersion": "11.00.17134.1"
    }
  },
  {
    "name": "ie",
    "path": "C:\\Program Files (x86)\\Internet Explorer\\iexplore.exe",
    "version": "11.0.17134.1",
    "arch": "i386",
    "info": {
      "FileVersion": "11.0.17134.1",
      "CompanyName": "Microsoft Corporation",
      "FileDescription": "Internet Explorer",
      "InternalName": "iexplore",
      "LegalCopyright": "© Microsoft Corporation. Alle rechten voorbehouden.",
      "OriginalFilename": "IEXPLORE.EXE.MUI",
      "ProductName": "Internet Explorer",
      "ProductVersion": "11.00.17134.1"
    }
  },
  {
    "name": "firefox",
    "path": "C:\\Program Files\\Mozilla Firefox\\firefox.exe",
    "version": "61.0.0.6711",
    "channel": "release",
    "arch": "amd64",
    "info": {
      "FileVersion": "61.0.0.6711",
      "LegalCopyright": "©Firefox and Mozilla Developers; available under the MPL 2 license.",
      "CompanyName": "Mozilla Corporation",
      "FileDescription": "Firefox",
      "ProductVersion": "61.0",
      "InternalName": "Firefox",
      "LegalTrademarks": "Firefox is a Trademark of The Mozilla Foundation.",
      "OriginalFilename": "../../dist/bin/firefox.exe",
      "ProductName": "Firefox",
      "BuildID": "20180517141400"
    }
  },
  {
    "name": "firefox",
    "path": "C:\\Program Files\\Firefox Developer Edition\\firefox.exe",
    "version": "61.0.0.6711",
    "channel": "developer",
    "arch": "amd64",
    "info": {
      "FileVersion": "61.0.0.6711",
      "LegalCopyright": "©Firefox and Mozilla Developers; available under the MPL 2 license.",
      "CompanyName": "Mozilla Corporation",
      "FileDescription": "Firefox Developer Edition",
      "ProductVersion": "61.0",
      "InternalName": "Firefox Developer Edition",
      "LegalTrademarks": "Firefox is a Trademark of The Mozilla Foundation.",
      "OriginalFilename": "../../dist/bin/firefox.exe",
      "ProductName": "Firefox Developer Edition",
      "BuildID": "20180517141400"
    }
  },
  {
    "name": "firefox",
    "path": "C:\\Program Files\\Firefox Nightly\\firefox.exe",
    "version": "62.0.0.6712",
    "channel": "nightly",
    "arch": "amd64",
    "info": {
      "FileVersion": "62.0.0.6712",
      "LegalCopyright": "©Firefox and Mozilla Developers; available under the MPL 2 license.",
      "CompanyName": "Mozilla Corporation",
      "FileDescription": "Firefox Nightly",
      "ProductVersion": "62.0a1",
      "InternalName": "Firefox Nightly",
      "LegalTrademarks": "Firefox is a Trademark of The Mozilla Foundation.",
      "OriginalFilename": "firefox.exe",
      "ProductName": "Firefox Nightly",
      "BuildID": "20180518222751"
    }
  },
  {
    "name": "chrome",
    "path": "C:\\Users\\vweevers\\AppData\\Local\\Google\\Chrome SxS\\Application\\chrome.exe",
    "version": "68.0.3436.0",
    "channel": "canary",
    "arch": "amd64",
    "bitness": 64,
    "guid": "4EA16AC7-FD5A-47C3-875B-DBF4A2008C20",
    "info": {
      "FileVersion": "68.0.3436.0",
      "CompanyName": "Google Inc.",
      "FileDescription": "Google Chrome",
      "InternalName": "chrome_exe",
      "LegalCopyright": "Copyright 2017 Google Inc. All rights reserved.",
      "OriginalFilename": "chrome.exe",
      "ProductName": "Google Chrome",
      "ProductVersion": "68.0.3436.0",
      "CompanyShortName": "Google",
      "ProductShortName": "Chrome",
      "LastChange": "e0f81fe637f233bf12e821915b72bc8d2194c3f2-refs/branch-heads/3436@{#1}",
      "Official Build": "1"
    },
    "uninstall": {
      "path": "C:\\Users\\vweevers\\AppData\\Local\\Google\\Chrome SxS\\Application\\68.0.3436.0\\Installer\\setup.exe",
      "arguments": [
        "--uninstall",
        "--chrome-sxs"
      ]
    }
  },
  {
    "name": "chrome",
    "path": "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "version": "66.0.3359.181",
    "channel": "stable",
    "arch": "amd64",
    "bitness": 64,
    "guid": "8A69D345-D564-463C-AFF1-A69D9E530F96",
    "info": {
      "FileVersion": "66.0.3359.181",
      "CompanyName": "Google Inc.",
      "FileDescription": "Google Chrome",
      "InternalName": "chrome_exe",
      "LegalCopyright": "Copyright 2017 Google Inc. All rights reserved.",
      "OriginalFilename": "chrome.exe",
      "ProductName": "Google Chrome",
      "ProductVersion": "66.0.3359.181",
      "CompanyShortName": "Google",
      "ProductShortName": "Chrome",
      "LastChange": "a10b9cedb40738cb152f8148ddab4891df876959-refs/branch-heads/3359@{#828}",
      "Official Build": "1"
    },
    "uninstall": {
      "path": "C:\\Program Files (x86)\\Google\\Chrome\\Application\\66.0.3359.181\\Installer\\setup.exe",
      "arguments": [
        "--uninstall",
        "--system-level",
        "--verbose-logging"
      ]
    }
  },
  {
    "name": "opera",
    "path": "C:\\Program Files\\Opera beta\\Launcher.exe",
    "version": "53.0.2907.31",
    "channel": "beta",
    "arch": "amd64",
    "info": {
      "FileVersion": "53.0.2907.31",
      "LegalCopyright": "Copyright Opera Software 2018",
      "InternalName": "Opera",
      "CompanyName": "Opera Software",
      "ProductName": "Opera beta Internet Browser",
      "ProductVersion": "53.0.2907.31",
      "FileDescription": "Opera beta Internet Browser"
    }
  }
]
```

</details>

## Install

With [npm](https://npmjs.org) do:

```bash
npm install win-detect-browsers     # For API
npm install win-detect-browsers -g  # For CLI
```

## Background

Browser detection on Windows can't be done right. This is the _try-everything-and-fail-silently_ approach. It accounts for architecture differences, normalizes environment variables, tries default locations, searches the registry (in the HKLM and HKCU hives as well as WoW counterparts) (including [Start Menu Internet Applications](http://msdn.microsoft.com/en-us/library/windows/desktop/dd203067(v=vs.85).aspx), Google Updater and more), and looks in `PATH`. Version numbers are then read from the executable metadata.

`browser-launcher` by substack has [poor Windows support](https://github.com/substack/browser-launcher/issues/7), and it prompted me to create this module. It is now used in [browser-launcher2](https://github.com/benderjs/browser-launcher2), ~~an active~~ a once active fork of `browser-launcher`.

## License

[MIT](./LICENSE) © 2014-present Vincent Weevers.
