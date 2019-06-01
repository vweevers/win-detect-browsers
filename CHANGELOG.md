# Changelog

## [4.0.0] - 2019-06-01

### Changed

- Upgrade `win-version-info` from `~2.1.0` to `~3.0.0` ([#46](https://github.com/vweevers/win-detect-browsers/issues/46)) ([`d92aee4`](https://github.com/vweevers/win-detect-browsers/commit/d92aee4))
- Upgrade `resolve` from `~1.8.1` to `~1.11.0` ([`0fda232`](https://github.com/vweevers/win-detect-browsers/commit/0fda232), [`1e0502a`](https://github.com/vweevers/win-detect-browsers/commit/1e0502a))
- Upgrade `registry-js` from `~1.0.7` to `~1.4.0` ([`0fda232`](https://github.com/vweevers/win-detect-browsers/commit/0fda232), [`f1269fe`](https://github.com/vweevers/win-detect-browsers/commit/f1269fe))
- Upgrade `yargs` from `~12.0.4` to `~13.2.2` ([`0fda232`](https://github.com/vweevers/win-detect-browsers/commit/0fda232))
- Upgrade `tape` devDependency from `~4.9.0` to `~4.10.1` ([`0fda232`](https://github.com/vweevers/win-detect-browsers/commit/0fda232))
- Use standard badge style in `README.md` ([`fe624eb`](https://github.com/vweevers/win-detect-browsers/commit/fe624eb))

### Added

- Add node 12 to AppVeyor ([`f3e8f2e`](https://github.com/vweevers/win-detect-browsers/commit/f3e8f2e))

### Removed

- Drop support for PhantomJS ([#44](https://github.com/vweevers/win-detect-browsers/issues/44)) ([`ca6448d`](https://github.com/vweevers/win-detect-browsers/commit/ca6448d)) ([**@pimterry**](https://github.com/pimterry))
- Remove node 9 from AppVeyor ([`f3e8f2e`](https://github.com/vweevers/win-detect-browsers/commit/f3e8f2e))
- Drop node 6 ([#38](https://github.com/vweevers/win-detect-browsers/issues/38)) ([`0fda232`](https://github.com/vweevers/win-detect-browsers/commit/0fda232))

## [3.1.0] - 2018-11-24

### Changed

- Move changelog to `CHANGELOG.md`

### Added

- Detect [Beaker](https://beakerbrowser.com/)
- Detect [Brave](https://brave.com/)
- Add [`hallmark`](https://github.com/vweevers/hallmark) devDependency

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

[4.0.0]: https://github.com/vweevers/win-detect-browsers/compare/v3.1.0...v4.0.0

[3.1.0]: https://github.com/vweevers/win-detect-browsers/compare/v3.0.0...v3.1.0

[3.0.0]: https://github.com/vweevers/win-detect-browsers/compare/v3.0.0-rc1...v3.0.0

[3.0.0-rc1]: https://github.com/vweevers/win-detect-browsers/compare/v2.1.0...v3.0.0-rc1
