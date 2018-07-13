# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="13.0.0"></a>
# [13.0.0](https://github.com/tivac/modular-css/compare/v12.1.3...v13.0.0) (2018-07-13)


### Bug Fixes

* Rollup rebuilds in watch mode ([#449](https://github.com/tivac/modular-css/issues/449)) ([d2eefec](https://github.com/tivac/modular-css/commit/d2eefec))
* support no assetFileNames configuration ([#448](https://github.com/tivac/modular-css/issues/448)) ([9e495dc](https://github.com/tivac/modular-css/commit/9e495dc)), closes [#447](https://github.com/tivac/modular-css/issues/447)


### BREAKING CHANGES

* `Processor.remove()` no longer removes the specified files AND their dependencies.





<a name="12.1.3"></a>
## [12.1.3](https://github.com/tivac/modular-css/compare/v12.1.2...v12.1.3) (2018-07-05)


### Bug Fixes

* Actually fix erroneous deletes from rollup ([caee07d](https://github.com/tivac/modular-css/commit/caee07d))





<a name="12.1.2"></a>
## [12.1.2](https://github.com/tivac/modular-css/compare/v12.1.0...v12.1.2) (2018-07-05)


### Bug Fixes

* Improve rollup dependency removal ([#442](https://github.com/tivac/modular-css/issues/442)) ([fb6c61a](https://github.com/tivac/modular-css/commit/fb6c61a)), closes [#441](https://github.com/tivac/modular-css/issues/441)





<a name="12.1.1"></a>
## [12.1.1](https://github.com/tivac/modular-css/compare/v12.1.0...v12.1.1) (2018-07-05)


### Bug Fixes

* Improve rollup dependency removal ([#442](https://github.com/tivac/modular-css/issues/442)) ([fb6c61a](https://github.com/tivac/modular-css/commit/fb6c61a)), closes [#441](https://github.com/tivac/modular-css/issues/441)





<a name="12.1.0"></a>
# [12.1.0](https://github.com/tivac/modular-css/compare/v12.0.2...v12.1.0) (2018-06-26)


### Features

* rollup transform dependencies support ([#438](https://github.com/tivac/modular-css/issues/438)) ([7347d8f](https://github.com/tivac/modular-css/commit/7347d8f))





<a name="12.0.2"></a>
## [12.0.2](https://github.com/tivac/modular-css/compare/v12.0.1...v12.0.2) (2018-06-22)

**Note:** Version bump only for package modular-css-rollup





<a name="12.0.1"></a>
## [12.0.1](https://github.com/tivac/modular-css/compare/v12.0.0...v12.0.1) (2018-06-13)


### Bug Fixes

* .emitAsset() can't be called twice now ([24e6562](https://github.com/tivac/modular-css/commit/24e6562))





<a name="12.0.0"></a>
# [12.0.0](https://github.com/tivac/modular-css/compare/v11.0.0...v12.0.0) (2018-06-08)


### Features

* rework svelte & rollup ([#430](https://github.com/tivac/modular-css/issues/430)) ([c80dafe](https://github.com/tivac/modular-css/commit/c80dafe))


### BREAKING CHANGES

* - `modular-css-svelte` no longer has a custom rollup integration, use `modular-css-rollup` instead
- `modular-css-rollup` now supports a `common` option that will handle outputting any CSS that was removed from chunks due to treeshaking.
- `modular-css-rollup` accepts a new `processor` option that is expected to be a fully-configured & instantiated instance of `Processor` from `modular-css-core`.





<a name="11.0.0"></a>
# [11.0.0](https://github.com/tivac/modular-css/compare/v10.1.0...v11.0.0) (2018-06-07)


### Features

* support for rollup@0.60.0 api ([#429](https://github.com/tivac/modular-css/issues/429)) ([f731e9b](https://github.com/tivac/modular-css/commit/f731e9b))


### BREAKING CHANGES

* This will break compatibility with all versions of rollup < 0.60.0





<a name="10.1.0"></a>
# [10.1.0](https://github.com/tivac/modular-css/compare/v10.0.0...v10.1.0) (2018-06-03)

**Note:** Version bump only for package modular-css-rollup





<a name="10.0.0"></a>
# [10.0.0](https://github.com/tivac/modular-css/compare/v9.0.0...v10.0.0) (2018-05-02)


### Bug Fixes

* adding new files w/ rollup shouldn't error ([#422](https://github.com/tivac/modular-css/issues/422)) ([67e1707](https://github.com/tivac/modular-css/commit/67e1707)), closes [#421](https://github.com/tivac/modular-css/issues/421)


### BREAKING CHANGES

* Processor.remove now always returns an array. If
nothing was removed the array will be empty.





<a name="9.0.0"></a>
# [9.0.0](https://github.com/tivac/modular-css/compare/v8.2.0...v9.0.0) (2018-04-25)


### Features

* svelte v2 support ([9c48aef](https://github.com/tivac/modular-css/commit/9c48aef))


### BREAKING CHANGES

* svelte template syntax changed in v2, and it is now the only supported syntax.





<a name="8.1.0"></a>
# [8.1.0](https://github.com/tivac/modular-css/compare/v8.0.3...v8.1.0) (2018-02-21)




**Note:** Version bump only for package modular-css-rollup

<a name="8.0.2"></a>
## [8.0.2](https://github.com/tivac/modular-css/compare/v8.0.0...v8.0.2) (2018-02-16)


### Bug Fixes

* Correctly support named exports of  [@value](https://github.com/value) ([#399](https://github.com/tivac/modular-css/issues/399)) ([166bfb2](https://github.com/tivac/modular-css/commit/166bfb2))




<a name="8.0.0"></a>
# [8.0.0](https://github.com/tivac/modular-css/compare/v7.2.0...v8.0.0) (2018-02-09)


### Features

* External source maps ([#326](https://github.com/tivac/modular-css/issues/326)) ([8df5baa](https://github.com/tivac/modular-css/commit/8df5baa))




<a name="7.2.0"></a>
# [7.2.0](https://github.com/tivac/modular-css/compare/v7.1.0...v7.2.0) (2017-12-13)


### Bug Fixes

* rollup watching loses file contents ([#377](https://github.com/tivac/modular-css/issues/377)) ([347ee8d](https://github.com/tivac/modular-css/commit/347ee8d))




<a name="7.1.0"></a>
# [7.1.0](https://github.com/tivac/modular-css/compare/v7.0.0...v7.1.0) (2017-12-11)


### Bug Fixes

* onwrite not returning the promise ([9ab15de](https://github.com/tivac/modular-css/commit/9ab15de))


### Features

* Svelte preprocess support ([#374](https://github.com/tivac/modular-css/issues/374)) ([0216a0c](https://github.com/tivac/modular-css/commit/0216a0c))




<a name="7.0.0"></a>
# [7.0.0](https://github.com/tivac/modular-css/compare/v6.1.0...v7.0.0) (2017-11-16)




**Note:** Version bump only for package modular-css-rollup

# 5.2.0

- feat: Option to disable named exports (#304)

# 4.1.4

- fix: avoid dependencies going missing with rollup (#266)

# 4.0.0

- refactor: convert to separate packages using lerna (#253)
