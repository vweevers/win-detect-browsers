# Changelog

## [3.1.0] - 2018-11-24

### Changed

- Move changelog to `CHANGELOG.md`

### Added

- Detect [Beaker](https://beakerbrowser.com/)
- Detect [Brave](https://brave.com/)

### Fixed

- Fix race issue ([#36](https://github.com/vweevers/win-detect-browsers/issues/36))

## [3.0.0] - 2018-11-24

### Changed

- Move `registry-js` and `win-version-info` out of `optionalDependencies`. Both are safe to install on all platforms and export a noop on non-windows.
- Update `debug`, `resolve` and `yargs`
- Add `standard`

## [3.0.0-rc1] - 2018-05-20

### Changed

- Error-first callback: `cb(err, browsers)` instead of `cb(browsers)`
- Remove streams: with new metadata being discovered via multiple avenues, results have to be merged before we can emit something;
- More than 2x faster by using native modules: [registry-js](https://www.npmjs.com/package/registry-js) to read the Windows Registry and [win-version-info](https://www.npmjs.org/package/win-version-info) to read executable metadata. No longer spawns child processes.

### Added

- Add Node 6, 8, 9, 10
- Add release channel for Chrome, Firefox and Opera
- Add executable metadata and CPU type to all browsers
- Support `phantomjs-prebuilt` (2.x) as well as `phantomjs` (1.x)
- Detect Firefox ESR
- Add Firefox Developer Edition default location;
- Add Firefox Nightly default location.

### Removed

- Drop Node 0.10, 4, 5
- Drop XP and Vista
- Remove `version` option;
- Remove `lucky` option.

## 2.0.0 - 2018-05-03

### Changed

- Speed improvement (2-4x), because it uses a single `cscript` process to query the registry (replaces `reg` queries) and a single `cscript` process to get the version numbers (replaces `wmic` queries).
- Exports a readable object stream, but 1.x callback style is still supported
- Only emits executables (`*.exe`)
- No longer uses command-line version flags or version numbers found in the registry or elsewhere. This simplifies the process and makes the version numbers consistent and more detailed.

[3.1.0]: https://github.com/vweevers/win-detect-browsers/compare/v3.0.0...v3.1.0
[3.0.0]: https://github.com/vweevers/win-detect-browsers/compare/v3.0.0-rc1...v3.0.0
[3.0.0-rc1]: https://github.com/vweevers/win-detect-browsers/compare/v2.1.0...v3.0.0-rc1
