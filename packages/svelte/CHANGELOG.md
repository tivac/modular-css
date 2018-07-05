# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="12.1.2"></a>
## [12.1.2](https://github.com/tivac/modular-css/compare/v12.1.0...v12.1.2) (2018-07-05)

**Note:** Version bump only for package modular-css-svelte





<a name="12.1.1"></a>
## [12.1.1](https://github.com/tivac/modular-css/compare/v12.1.0...v12.1.1) (2018-07-05)

**Note:** Version bump only for package modular-css-svelte





<a name="12.1.0"></a>
# [12.1.0](https://github.com/tivac/modular-css/compare/v12.0.2...v12.1.0) (2018-06-26)

**Note:** Version bump only for package modular-css-svelte





<a name="12.0.2"></a>
## [12.0.2](https://github.com/tivac/modular-css/compare/v12.0.1...v12.0.2) (2018-06-22)


### Bug Fixes

* Correct replacements of css.<key> values ([#436](https://github.com/tivac/modular-css/issues/436)) ([b4de308](https://github.com/tivac/modular-css/commit/b4de308))





<a name="12.0.1"></a>
## [12.0.1](https://github.com/tivac/modular-css/compare/v12.0.0...v12.0.1) (2018-06-13)

**Note:** Version bump only for package modular-css-svelte





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

**Note:** Version bump only for package modular-css-svelte





<a name="10.1.0"></a>
# [10.1.0](https://github.com/tivac/modular-css/compare/v10.0.0...v10.1.0) (2018-06-03)


### Features

* support <link> elements in svelte ([#426](https://github.com/tivac/modular-css/issues/426)) ([49f8f0a](https://github.com/tivac/modular-css/commit/49f8f0a))





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





<a name="8.2.0"></a>
# [8.2.0](https://github.com/tivac/modular-css/compare/v8.1.1...v8.2.0) (2018-03-08)


### Bug Fixes

* webpack tests ([#414](https://github.com/tivac/modular-css/issues/414)) ([d240805](https://github.com/tivac/modular-css/commit/d240805)), closes [#413](https://github.com/tivac/modular-css/issues/413)




<a name="8.1.0"></a>
# [8.1.0](https://github.com/tivac/modular-css/compare/v8.0.3...v8.1.0) (2018-02-21)




**Note:** Version bump only for package modular-css-svelte

<a name="8.0.2"></a>
## [8.0.2](https://github.com/tivac/modular-css/compare/v8.0.0...v8.0.2) (2018-02-16)


### Bug Fixes

* Correctly support named exports of  [@value](https://github.com/value) ([#399](https://github.com/tivac/modular-css/issues/399)) ([166bfb2](https://github.com/tivac/modular-css/commit/166bfb2))




<a name="8.0.0"></a>
# [8.0.0](https://github.com/tivac/modular-css/compare/v7.2.0...v8.0.0) (2018-02-09)


### Features

* Exporting values. ([#396](https://github.com/tivac/modular-css/issues/396)) ([#398](https://github.com/tivac/modular-css/issues/398)) ([4a15d8f](https://github.com/tivac/modular-css/commit/4a15d8f))
* External source maps ([#326](https://github.com/tivac/modular-css/issues/326)) ([8df5baa](https://github.com/tivac/modular-css/commit/8df5baa))


### BREAKING CHANGES

* Values will now be exported alongside composed classes




<a name="7.2.0"></a>
# [7.2.0](https://github.com/tivac/modular-css/compare/v7.1.0...v7.2.0) (2017-12-13)




**Note:** Version bump only for package modular-css-svelte

<a name="7.1.0"></a>
# [7.1.0](https://github.com/tivac/modular-css/compare/v7.0.0...v7.1.0) (2017-12-11)


### Features

* Svelte preprocess support ([#374](https://github.com/tivac/modular-css/issues/374)) ([0216a0c](https://github.com/tivac/modular-css/commit/0216a0c))
