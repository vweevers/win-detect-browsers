# win-detect-browsers

> Detects installed versions of Chrome, Firefox, Phantomjs, Internet Explorer and Opera. 

[Command line](#command-line) / [API](#api) / [License](#license)

## About

`browser-launcher` by substack has [poor Windows support](https://github.com/substack/browser-launcher/issues/7), and it prompted me to create this module. Basically, browser detection can't be done right. This is the *try-everything-and-fail-silently* approach. For XP and up, it:

1. Tries default locations (in `Program Files`, `Program Files (x86)`, `AppData` and such)
2. Searches the registry, using:
  - A set of common keys per browser (accounting for x64/86 differences) and the ["Start Menu Internet Applications"](http://msdn.microsoft.com/en-us/library/windows/desktop/dd203067(v=vs.85).aspx) keys
  - Both `LOCAL_MACHINE` and `CURRENT_USER`
3. Looks in your `PATH` using [which](https://github.com/isaacs/node-which) (useful for custom locations, portable installs, and such)

After gathering paths, version numbers are either read from the executable metadata using `wmic` or with `browser -v`.

`win-detect-browsers` has been tested on:

- Win7 x64 with Chrome, FF, IE, phantomjs
- Win7 x86 with Chrome, Canary, FF, FF nightly, IE, Opera, Safari
- WinXP with Chrome, FF, IE, Opera, phantomjs

## Command line

Install globally and run:

    npm i win-detect-browsers -g
    win-detect-browsers

Example output on Windows XP:

    chrome 39.0.2171.71
      @ C:\Program Files\Google\Chrome\Application\chrome.exe
    firefox 33.0.2
      @ C:\Program Files\Mozilla Firefox\firefox.exe
    ie 8.00.6001.18702
      @ C:\Program Files\Internet Explorer\iexplore.exe
    opera 26.0.1656.24
      @ C:\Program Files\Opera\Launcher.exe
    opera 26.0.1656.20
      @ C:\Program Files\Opera beta\Launcher.exe
    opera 27.0.1689.2
      @ C:\Program Files\Opera developer\Launcher.exe
    phantomjs 1.9.8
      @ C:\Documents and Settings\..\Application Data\npm\phantomjs.CMD

Enable debug with `SET DEBUG=win-detect-browsers`.

### examples

Detect Internet Explorer and Phantomjs, without version numbers:

    win-detect-browsers --no-version ie phantomjs

Return first found version of FF:

    win-detect-browsers --lucky firefox

## API

`detect([names, opts,] cb)`

Where `names` is an array of browser names you want to find. If omitted, it will detect all browsers. Available options are:

- `boolean lucky` whether to end the search for a browser after the first result. Note that this result is not consistent, because search is asynchronous. Defaults to `false`, meaning: find all versions.
- `boolean version` whether to get version numbers, defaults to `true`.

## examples

Detect *[everything](http://youtu.be/k1yvvNvlXtg)*:

```js
var detect = require('win-detect-browsers')

detect(function(browsers){
  var format = "\n%s %s\n  @ %s"
  browsers.forEach(function(b){
    console.log(format, b.name, b.version, b.path)
  })
})

```

Detect only Chrome and IE, without version numbers:

```js
detect(['chrome', 'ie'], {version: false}, cb)
```

## License

[MIT](http://opensource.org/licenses/MIT) © [Vincent Weevers](http://vincentweevers.nl)
