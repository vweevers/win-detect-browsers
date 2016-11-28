# win-detect-browsers

**Fast browser detection on Windows. Detects installed versions of Chrome, Chromium, Firefox, PhantomJS, Internet Explorer, Safari, Opera, Maxthon and Yandex.**

[![npm status](http://img.shields.io/npm/v/win-detect-browsers.svg?style=flat-square)](https://www.npmjs.org/package/win-detect-browsers) [![Build status](https://img.shields.io/appveyor/ci/vweevers/win-detect-browsers.svg?style=flat-square)](https://ci.appveyor.com/project/vweevers/win-detect-browsers) [![Dependency Status](https://img.shields.io/david/vweevers/win-detect-browsers.svg?style=flat-square)](https://david-dm.org/vweevers/win-detect-browsers)

## example

```js
const detect = require('win-detect-browsers')

// All browsers
detect(function (err, browsers) {
  if (err) throw err
  console.log(browsers)
})

// Chrome and Firefox with channel info
detect(['chrome', 'firefox'], { channels: true }, function (err, browsers) {
  for(let b of browsers) {
    console.log(b.version) // '57.0.2931.0'
    console.log(b.channel) // 'canary'
  }
})
```

## `detect([names, options],  callback)`

> **Usage changed in 3.0.0. Please read [the changelog](#300).**

`names` is an array of browser names you want to find. If omitted or empty, it will detect *[everything](http://youtu.be/k1yvvNvlXtg)*. You can differentiate release channels by setting `options.channels` to true. The `callback` receives an error (if any) and an array of `results`. Each `result` contains:

- **name**: `chrome`, `chromium`, `firefox`, `phantomjs`, `ie`, `safari`, `opera`, `maxthon` or `yandex`.
- **path**: absolute path to executable
- **version**
- **channel** (opt-in):
  - Chrome: `stable`, `canary`, `beta` or `dev`
  - Firefox: `release`, `developer` or `nightly`
  - Older versions of Firefox: `release`, `aurora`, `beta` or `rc`
  - Opera: `stable`, `beta` or `developer`
- **info**: additional version info (see [cli example](#cli) below).

## cli

Install globally and run:

    npm i win-detect-browsers -g
    win-detect-browsers

Example output on Windows 8.1:

```
todo
```

Enable debug with `SET DEBUG=win-detect-browsers`.

Detect Internet Explorer and Phantomjs, or output JSON:

```
> win-detect-browsers ie phantomjs
> win-detect-browsers --json
```

## changelog

### 3.0.0

**Breaking changes:**

- Drop support of Node < 4 and XP and Vista
- Error-first callbacks: use `cb(err, browsers)` instead of `cb(browsers)`
- Remove streaming mode: with new metadata being discovered via multiple avenues, results have to be merged before we can emit something
- Remove the `version` option;
- Undocument the `lucky` option: it can have surprising results. Kept for development.

**New features:**

- Add a `channel` property for Chrome, Firefox and Opera;
- Additional version info (like `ProductName`) for all browsers.

**Bugfixes and other improvements:**

- Support `phantomjs-prebuilt` (2.x) as well as `phantomjs` (1.x);
- Performance win: the native [win-version-info](https://www.npmjs.org/package/win-version-info) addon replaces the `cscript` child process.
- Rewrite the registry reader in JScript, with a JSON transport between Node.js and [Windows Script Host](https://en.wikipedia.org/wiki/Windows_Script_Host)

### 2.0.0

- Speed improvement (2-4x), because it uses a single `cscript` process to query the registry (replaces `reg` queries) and a single `cscript` process to get the version numbers (replaces `wmic` queries).
- Exports a readable object stream, but 1.x callback style is still supported
- Only emits executables (`*.exe`)
- No longer uses command-line version flags or version numbers found in the registry or elsewhere. This simplifies the process and makes the version numbers consistent and more detailed.

## why

Browser detection on Windows can't be done right. This is the *try-everything-and-fail-silently* approach. It accounts for architecture differences, normalizes environment variables, tries default locations, searches the registry (in the HKLM and HKCU hives as well as WoW counterparts) (including [Start Menu Internet Applications](http://msdn.microsoft.com/en-us/library/windows/desktop/dd203067(v=vs.85).aspx), Google Updater and more), and looks in `PATH`. Version numbers are then read from the executable metadata.

`browser-launcher` by substack has [poor Windows support](https://github.com/substack/browser-launcher/issues/7), and it prompted me to create this module. It is now used in [browser-launcher2](https://github.com/benderjs/browser-launcher2), ~~an active~~ a once active fork of `browser-launcher`.

## license

[MIT](http://opensource.org/licenses/MIT) © Vincent Weevers.
