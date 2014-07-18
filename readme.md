# win-detect-browsers

> Detects installed versions of Chrome, Firefox and Internet Explorer. 

[Command line](#command-line) / [API](#api) / [License](#license)

## About

`browser-launcher` by substack has [poor Windows support](https://github.com/substack/browser-launcher/issues/7), and it prompted me to create this module. Basically, browser detection can't be done right. This is the *try-everything-and-fail-silently* approach. For XP and up, it:

1. Tries default locations (in `Program Files`, `Program Files (x86)`, `AppData` and such)
2. Searches the registry, using:
  - A set of common keys per browser (accounting for x64/86 differences) and the ["Start Menu Internet Applications"](http://msdn.microsoft.com/en-us/library/windows/desktop/dd203067(v=vs.85).aspx) keys
  - Both `LOCAL_MACHINE` and `CURRENT_USER`
3. Looks in your `PATH` using [which](https://github.com/isaacs/node-which) (useful for custom locations, portable installs, and such)

After gathering paths, version numbers are read from the executable metadata using `wmic`. The whole thing takes 1-3 seconds, but you only have to do it once.

`win-detect-browsers` is tested on Windows 7 x64 (with Chrome, Firefox, Internet Explorer) and Windows XP (with Chrome and IE). Using something else? Please open a issue to **report your results**, whether good or bad. I'd like to gather some more results before including this module in a PR to `browser-launcher`.

## Command line

To test this module, install globally:

    npm i win-detect-browsers -g

Then run:

    win-detect-browsers

Example output on Windows XP:

    chrome 35.0.1916.153
      @ C:\Program Files\Google\Chrome\Application\chrome.exe
    ie 8.00.6001.18702 (longhorn_ie8_rtm(wmbla).090308-0339)
      @ C:\Program Files\Internet Explorer\iexplore.exe

## API

The source of `bin/detect-browsers` says it all:

```js
var detect = require('../')

detect(function(browsers){
  var format = "\n%s %s\n  @ %s"
  browsers.forEach(function(b){
    console.log(format, b.name, b.version, b.path)
  })
})

```

## License

[MIT](http://opensource.org/licenses/MIT) © [Vincent Weevers](http://vincentweevers.nl)
