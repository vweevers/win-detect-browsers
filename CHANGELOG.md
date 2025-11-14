# Changelog

## [8.0.1] - 2025-11-14

### Changed

- Use trusted publishing ([`aead42e`](https://github.com/vweevers/win-detect-browsers/commit/aead42e)) (Vincent Weevers)

### Fixed

- Fix registry.js import ([#89](https://github.com/vweevers/win-detect-browsers/issues/89)) ([`daf13e5`](https://github.com/vweevers/win-detect-browsers/commit/daf13e5)) (Tim Perry)

## [8.0.0] - 2025-10-08

### Changed

- **Breaking:** switch to ESM ([`b86f41e`](https://github.com/vweevers/win-detect-browsers/commit/b86f41e)) (Vincent Weevers)
- Bump `win-version-info` from 5 to 6 ([`c08ec68`](https://github.com/vweevers/win-detect-browsers/commit/c08ec68)) (Vincent Weevers)
- Bump `which` from 2 to 5 ([`0dfd374`](https://github.com/vweevers/win-detect-browsers/commit/0dfd374)) (Vincent Weevers)
- Bump `yargs` from 16 to 18 ([`b90e5ba`](https://github.com/vweevers/win-detect-browsers/commit/b90e5ba)) (Vincent Weevers)

### Added

- Detect Opera GX and Opera Crypto ([#83](https://github.com/vweevers/win-detect-browsers/issues/83)) ([`0cd3e42`](https://github.com/vweevers/win-detect-browsers/commit/0cd3e42)) (Navdeep Singh Rathore)

### Removed

- **Breaking:** drop Node.js < 20 ([`960b063`](https://github.com/vweevers/win-detect-browsers/commit/960b063)) (Vincent Weevers)
- **Breaking:** remove support of callbacks ([`02b0903`](https://github.com/vweevers/win-detect-browsers/commit/02b0903)) (Vincent Weevers)

### Fixed

- Don't detect Opera in PATH to avoid false positives ([#84](https://github.com/vweevers/win-detect-browsers/issues/84)) ([`6fc891e`](https://github.com/vweevers/win-detect-browsers/commit/6fc891e)) (Tim Perry)
- Fix detection of Edge Dev and add Edge channel detection ([#81](https://github.com/vweevers/win-detect-browsers/issues/81)) ([`8cfb07a`](https://github.com/vweevers/win-detect-browsers/commit/8cfb07a)) (Temm)

## [7.0.0] - 2021-11-12

### Changed

- **Breaking:** bump [`win-version-info`](https://github.com/vweevers/win-version-info) and `yargs` ([`b0c9ab0`](https://github.com/vweevers/win-detect-browsers/commit/b0c9ab0), [`b438175`](https://github.com/vweevers/win-detect-browsers/commit/b438175)) (Vincent Weevers). Drops support of Node.js 8.
- Change CLI to always print result as JSON ([`88dc694`](https://github.com/vweevers/win-detect-browsers/commit/88dc694)) (Vincent Weevers)
- Remove `xtend` dependency ([`fbcba58`](https://github.com/vweevers/win-detect-browsers/commit/fbcba58)) (Vincent Weevers)
- Refactor: remove unused pre hook ([`ec92805`](https://github.com/vweevers/win-detect-browsers/commit/ec92805)) (Vincent Weevers)
- Refactor: remove unused events and opts from Finder ([`48c683c`](https://github.com/vweevers/win-detect-browsers/commit/48c683c)) (Vincent Weevers)

### Added

- Add promise support ([`ca8d84e`](https://github.com/vweevers/win-detect-browsers/commit/ca8d84e)) (Vincent Weevers)

### Fixed

- Fix documentation of `name` ([`83a1f79`](https://github.com/vweevers/win-detect-browsers/commit/83a1f79)) (Vincent Weevers).

## [6.0.0] - 2020-03-04

### Changed

- **Breaking:** Stop detecting the Chrome-only guid & uninstall properties ([#68](https://github.com/vweevers/win-detect-browsers/issues/68)) ([**@pimterry**](https://github.com/pimterry))
- Upgrade `pascal-case` from `~2.0.1` to `~3.1.1` ([`addbdab`](https://github.com/vweevers/win-detect-browsers/commit/addbdab)) ([**@vweevers**](https://github.com/vweevers))
- Unlock dependencies ([`5e370a1`](https://github.com/vweevers/win-detect-browsers/commit/5e370a1)) ([**@vweevers**](https://github.com/vweevers))

## [5.0.0] - 2019-11-22

### Changed

- Upgrade `chalk` from `~2.4.1` to `~3.0.0` ([`8c8849d`](https://github.com/vweevers/win-detect-browsers/commit/8c8849d)) ([**@vweevers**](https://github.com/vweevers))
- Upgrade `which` from `~1.3.0` to `~2.0.1` ([`fdc033f`](https://github.com/vweevers/win-detect-browsers/commit/fdc033f)) ([**@vweevers**](https://github.com/vweevers))
- Upgrade `registry-js` from `~1.8.0` to `~1.9.0` ([#58](https://github.com/vweevers/win-detect-browsers/issues/58)) ([**@vweevers**](https://github.com/vweevers))
- Upgrade `yargs` from `~13.3.0` to `~15.0.1` ([`d45d938`](https://github.com/vweevers/win-detect-browsers/commit/d45d938), [`a63e8bf`](https://github.com/vweevers/win-detect-browsers/commit/a63e8bf), [`8d73bdc`](https://github.com/vweevers/win-detect-browsers/commit/8d73bdc)) ([**@vweevers**](https://github.com/vweevers))

### Added

- Detect the new chromium-based MS Edge ([#60](https://github.com/vweevers/win-detect-browsers/issues/60)) ([**@pimterry**](https://github.com/pimterry))

### Removed

- **Breaking:** remove `bitness` from chrome metadata ([#61](https://github.com/vweevers/win-detect-browsers/issues/61)) ([**@vweevers**](https://github.com/vweevers))

### Fixed

- Improve detection of Chrome channel variants ([#61](https://github.com/vweevers/win-detect-browsers/issues/61)) ([**@pimterry**](https://github.com/pimterry))
- Avoid errors if the registry is not readable ([#65](https://github.com/vweevers/win-detect-browsers/issues/65)) ([**@pimterry**](https://github.com/pimterry)). Previously this could happen if the user did not have access to the given hive or key.

## [4.0.1] - 2019-08-17

### Changed

- Upgrade `registry-js` from `~1.4.0` to `~1.8.0` ([#51](https://github.com/vweevers/win-detect-browsers/issues/51)) ([**@vweevers**](https://github.com/vweevers))
- Upgrade `yargs` from `~13.2.2` to `~13.3.0` ([#50](https://github.com/vweevers/win-detect-browsers/issues/50)) ([**@vweevers**](https://github.com/vweevers))
- Upgrade `hallmark` devDependency from `^0.1.0` to `^1.0.0` ([#49](https://github.com/vweevers/win-detect-browsers/issues/49)) ([**@vweevers**](https://github.com/vweevers))
- Upgrade `standard` devDependency from `^12.0.1` to `^13.0.1` ([#48](https://github.com/vweevers/win-detect-browsers/issues/48)) ([**@vweevers**](https://github.com/vweevers))
- Unlock devDependencies ([`e90ff25`](https://github.com/vweevers/win-detect-browsers/commit/e90ff25)) ([**@vweevers**](https://github.com/vweevers))

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

## [2.1.0] - 2015-05-05

### Changed

- Replace `fs.exists()` with `path-exists` ([`7ec303c`](https://github.com/vweevers/win-detect-browsers/commit/7ec303c))
- Prefer native cscript ([`8676bfb`](https://github.com/vweevers/win-detect-browsers/commit/8676bfb)) ([#18](https://github.com/vweevers/win-detect-browsers/issues/18))

### Fixed

- Uppercase environment variables ([`a2395b8`](https://github.com/vweevers/win-detect-browsers/commit/a2395b8))

## [2.0.0] - 2015-05-03

### Changed

- Speed improvement (2-4x), because it uses a single `cscript` process to query the registry (replaces `reg` queries) and a single `cscript` process to get the version numbers (replaces `wmic` queries).
- Exports a readable object stream, but 1.x callback style is still supported
- Only emits executables (`*.exe`)
- No longer uses command-line version flags or version numbers found in the registry or elsewhere. This simplifies the process and makes the version numbers consistent and more detailed.

[8.0.1]: https://github.com/vweevers/win-detect-browsers/releases/tag/v8.0.1

[8.0.0]: https://github.com/vweevers/win-detect-browsers/releases/tag/v8.0.0

[7.0.0]: https://github.com/vweevers/win-detect-browsers/releases/tag/v7.0.0

[6.0.0]: https://github.com/vweevers/win-detect-browsers/releases/tag/v6.0.0

[5.0.0]: https://github.com/vweevers/win-detect-browsers/releases/tag/v5.0.0

[4.0.1]: https://github.com/vweevers/win-detect-browsers/releases/tag/v4.0.1

[4.0.0]: https://github.com/vweevers/win-detect-browsers/releases/tag/v4.0.0

[3.1.0]: https://github.com/vweevers/win-detect-browsers/releases/tag/v3.1.0

[3.0.0]: https://github.com/vweevers/win-detect-browsers/releases/tag/v3.0.0

[3.0.0-rc1]: https://github.com/vweevers/win-detect-browsers/releases/tag/v3.0.0-rc1

[2.1.0]: https://github.com/vweevers/win-detect-browsers/releases/tag/v2.1.0

[2.0.0]: https://github.com/vweevers/win-detect-browsers/releases/tag/v2.0.0
