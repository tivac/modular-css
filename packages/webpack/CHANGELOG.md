# Change Log

## 28.3.2

### Patch Changes

- Updated dependencies [[`8983ec7`](https://github.com/tivac/modular-css/commit/8983ec74fe945f2859c4078e66ef15095a75f9be)]:
  - @modular-css/processor@28.1.5
  - @modular-css/css-to-js@28.4.1

## 28.3.1

### Patch Changes

- Updated dependencies [[`6211b85`](https://github.com/tivac/modular-css/commit/6211b859abf83f95ffcce0d741d9e82628f97eb5)]:
  - @modular-css/css-to-js@28.4.0

## 28.3.0

### Minor Changes

- [#901](https://github.com/tivac/modular-css/pull/901) [`02bc885`](https://github.com/tivac/modular-css/commit/02bc88570045be3e6e23adff5411b6ad1883d104) Thanks [@plesiecki](https://github.com/plesiecki)! - New option to change type of variable declaration — `variableDeclaration` which defaults to `const`. Can be set to `var` if necessary, e.g. ES5 support.

### Patch Changes

- Updated dependencies [[`02bc885`](https://github.com/tivac/modular-css/commit/02bc88570045be3e6e23adff5411b6ad1883d104)]:
  - @modular-css/css-to-js@28.3.0

## 28.2.5

### Patch Changes

- Updated dependencies [[`b1af909`](https://github.com/tivac/modular-css/commit/b1af909ceaa2dbc4b54c376b9ed5a14a824c6e89)]:
  - @modular-css/css-to-js@28.2.4

## 28.2.4

### Patch Changes

- Updated dependencies [[`daa9c53`](https://github.com/tivac/modular-css/commit/daa9c535e19f434e651fcbbbaf7cf48fa7b481ae)]:
  - @modular-css/processor@28.1.4
  - @modular-css/css-to-js@28.2.3

## 28.2.3

### Patch Changes

- [#872](https://github.com/tivac/modular-css/pull/872) [`c4035e7`](https://github.com/tivac/modular-css/commit/c4035e789f99c0e530a11faad2477640484c971e) Thanks [@plesiecki](https://github.com/plesiecki)! - Do not invalidate files the `processor` doesn't already know about.

## 28.2.2

### Patch Changes

- Updated dependencies [[`2a20cd5`](https://github.com/tivac/modular-css/commit/2a20cd528d3a1dd34d2f034400ce334aeffa09ec)]:
  - @modular-css/css-to-js@28.2.2

## 28.2.1

### Patch Changes

- Updated dependencies [[`c19671f`](https://github.com/tivac/modular-css/commit/c19671fb8c4798d98a79e6f1d09cfc26e8a12eb7), [`c19671f`](https://github.com/tivac/modular-css/commit/c19671fb8c4798d98a79e6f1d09cfc26e8a12eb7), [`c19671f`](https://github.com/tivac/modular-css/commit/c19671fb8c4798d98a79e6f1d09cfc26e8a12eb7)]:
  - @modular-css/css-to-js@28.2.1

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [28.2.0](https://github.com/tivac/modular-css/compare/v28.1.4...v28.2.0) (2022-06-20)

### Features

- **webpack:** webpack@5 support ([2de5396](https://github.com/tivac/modular-css/commit/2de5396753db55d82abcbb961b62391742aae55c))

## [28.1.3](https://github.com/tivac/modular-css/compare/v28.1.2...v28.1.3) (2022-06-15)

**Note:** Version bump only for package @modular-css/webpack

# [28.0.0](https://github.com/tivac/modular-css/compare/v27.2.0...v28.0.0) (2022-02-25)

**Note:** Version bump only for package @modular-css/webpack

# [27.1.0](https://github.com/tivac/modular-css/compare/v27.0.3...v27.1.0) (2022-02-03)

### Bug Fixes

- **webpack:** remove deprecated cjs option ([3489907](https://github.com/tivac/modular-css/commit/3489907e69ccd2fec69fc015cefbb6b87225cc3e))

## [27.0.3](https://github.com/tivac/modular-css/compare/v26.0.0...v27.0.3) (2021-12-17)

### Bug Fixes

- **www:** get REPL working again ([#797](https://github.com/tivac/modular-css/issues/797)) ([c6ffbb5](https://github.com/tivac/modular-css/commit/c6ffbb54a025f4809c7a6a9d12606e54fa1d2d28))

### Code Refactoring

- postcss8 native support ([#795](https://github.com/tivac/modular-css/issues/795)) ([331b833](https://github.com/tivac/modular-css/commit/331b833e8de6a4f952be0735441c5d7589aa2ed0))

### BREAKING CHANGES

- - Only supports `postcss@8` and higher

* `composes` and `@values` that reference other entries will need to be listed in dependency order.

## [27.0.2](https://github.com/tivac/modular-css/compare/v27.0.1...v27.0.2) (2021-07-18)

**Note:** Version bump only for package @modular-css/webpack

## [27.0.1](https://github.com/tivac/modular-css/compare/v27.0.0...v27.0.1) (2021-07-18)

**Note:** Version bump only for package @modular-css/webpack

# [27.0.0](https://github.com/tivac/modular-css/compare/v26.0.0...v27.0.0) (2021-07-06)

**Note:** Version bump only for package @modular-css/webpack

# [26.0.0](https://github.com/tivac/modular-css/compare/v25.8.2...v26.0.0) (2021-02-25)

### Features

- fine-grained dependency tracking ([597ae42](https://github.com/tivac/modular-css/commit/597ae42183b4c15bee368609a84e4e991b497e30))
- postcss@8 support ([#789](https://github.com/tivac/modular-css/issues/789)) ([340a38e](https://github.com/tivac/modular-css/commit/340a38e45bbb64d2e1ee7fc82882995383466bd3))

### BREAKING CHANGES

- postcss@8 drops support for node version 6.x, 8.x, 11.x, and 13.x.

## [25.8.2](https://github.com/tivac/modular-css/compare/v25.8.1...v25.8.2) (2020-09-02)

**Note:** Version bump only for package @modular-css/webpack

# [25.8.0](https://github.com/tivac/modular-css/compare/v25.7.0...v25.8.0) (2020-06-29)

**Note:** Version bump only for package @modular-css/webpack

# [25.7.0](https://github.com/tivac/modular-css/compare/v25.6.0...v25.7.0) (2020-05-15)

**Note:** Version bump only for package @modular-css/webpack

# [25.6.0](https://github.com/tivac/modular-css/compare/v25.4.1...v25.6.0) (2020-04-21)

### Bug Fixes

- **webpack:** don't try to emit if there were errors ([#725](https://github.com/tivac/modular-css/issues/725)) ([e9de291](https://github.com/tivac/modular-css/commit/e9de2917481d62dac1a7aa02d946371518a7b66c)), closes [#724](https://github.com/tivac/modular-css/issues/724)

# [25.5.0](https://github.com/tivac/modular-css/compare/v25.4.1...v25.5.0) (2020-03-09)

### Bug Fixes

- **webpack:** don't try to emit if there were errors ([#725](https://github.com/tivac/modular-css/issues/725)) ([e9de291](https://github.com/tivac/modular-css/commit/e9de2917481d62dac1a7aa02d946371518a7b66c)), closes [#724](https://github.com/tivac/modular-css/issues/724)

## [25.4.1](https://github.com/tivac/modular-css/compare/v25.4.0...v25.4.1) (2020-02-12)

**Note:** Version bump only for package @modular-css/webpack

# [25.4.0](https://github.com/tivac/modular-css/compare/v25.3.1...v25.4.0) (2020-02-05)

**Note:** Version bump only for package @modular-css/webpack

## [25.3.1](https://github.com/tivac/modular-css/compare/v25.3.0...v25.3.1) (2020-01-23)

**Note:** Version bump only for package @modular-css/webpack

# [25.2.0](https://github.com/tivac/modular-css/compare/v25.1.0...v25.2.0) (2019-10-30)

### Features

- exportDefault flag for webpack loader ([#680](https://github.com/tivac/modular-css/issues/680)) ([0179f99](https://github.com/tivac/modular-css/commit/0179f99))

# [25.1.0](https://github.com/tivac/modular-css/compare/v25.0.0...v25.1.0) (2019-09-23)

**Note:** Version bump only for package @modular-css/webpack

# [25.0.0](https://github.com/tivac/modular-css/compare/v24.2.2...v25.0.0) (2019-09-16)

**Note:** Version bump only for package @modular-css/webpack

## [24.2.2](https://github.com/tivac/modular-css/compare/v24.2.0...v24.2.2) (2019-07-08)

**Note:** Version bump only for package @modular-css/webpack

# [24.2.0](https://github.com/tivac/modular-css/compare/v24.1.0...v24.2.0) (2019-07-06)

**Note:** Version bump only for package @modular-css/webpack

# [24.1.0](https://github.com/tivac/modular-css/compare/v24.0.1...v24.1.0) (2019-06-17)

### Features

- **webpack:** add styleExport option ([#613](https://github.com/tivac/modular-css/issues/613)) ([8fc3ae1](https://github.com/tivac/modular-css/commit/8fc3ae1))

## [24.0.1](https://github.com/tivac/modular-css/compare/v24.0.0...v24.0.1) (2019-05-29)

**Note:** Version bump only for package @modular-css/webpack

# [24.0.0](https://github.com/tivac/modular-css/compare/v23.0.6...v24.0.0) (2019-05-08)

**Note:** Version bump only for package @modular-css/webpack

## [23.0.4](https://github.com/tivac/modular-css/compare/v23.0.3...v23.0.4) (2019-04-03)

**Note:** Version bump only for package @modular-css/webpack

# [23.0.0](https://github.com/tivac/modular-css/compare/v22.3.0...v23.0.0) (2019-03-28)

**Note:** Version bump only for package @modular-css/webpack

# [22.2.0](https://github.com/tivac/modular-css/compare/v22.1.4...v22.2.0) (2019-03-07)

### Features

- Include Style String in Webpack Loader Output ([#567](https://github.com/tivac/modular-css/issues/567)) ([6d883ac](https://github.com/tivac/modular-css/commit/6d883ac))

## [22.1.4](https://github.com/tivac/modular-css/compare/v22.1.3...v22.1.4) (2019-02-16)

### Bug Fixes

- add homepage & repo directory fields ([f9c1606](https://github.com/tivac/modular-css/commit/f9c1606))

## [22.1.3](https://github.com/tivac/modular-css/compare/v22.1.2...v22.1.3) (2019-02-10)

### Bug Fixes

- clean up netlify deploys ([#566](https://github.com/tivac/modular-css/issues/566)) ([39c11d5](https://github.com/tivac/modular-css/commit/39c11d5))

## [22.1.2](https://github.com/tivac/modular-css/compare/v22.1.1...v22.1.2) (2019-02-09)

### Bug Fixes

- dependency processing race condition ([#565](https://github.com/tivac/modular-css/issues/565)) ([436c1c8](https://github.com/tivac/modular-css/commit/436c1c8))

# [22.1.0](https://github.com/tivac/modular-css/compare/v22.0.2...v22.1.0) (2019-02-06)

**Note:** Version bump only for package @modular-css/webpack

## [22.0.1](https://github.com/tivac/modular-css/compare/v22.0.0...v22.0.1) (2019-01-27)

**Note:** Version bump only for package @modular-css/webpack

# [22.0.0](https://github.com/tivac/modular-css/compare/v21.2.1...v22.0.0) (2019-01-25)

**Note:** Version bump only for package @modular-css/webpack

# [21.2.0](https://github.com/tivac/modular-css/compare/v21.1.2...v21.2.0) (2019-01-24)

**Note:** Version bump only for package @modular-css/webpack

## [21.1.1](https://github.com/tivac/modular-css/compare/v21.1.0...v21.1.1) (2019-01-21)

**Note:** Version bump only for package @modular-css/webpack

# [21.0.0](https://github.com/tivac/modular-css/compare/v20.0.1...v21.0.0) (2019-01-18)

**Note:** Version bump only for package @modular-css/webpack

# [20.0.0](https://github.com/tivac/modular-css/compare/v19.2.0...v20.0.0) (2019-01-15)

**Note:** Version bump only for package @modular-css/webpack

# [19.2.0](https://github.com/tivac/modular-css/compare/v19.1.0...v19.2.0) (2019-01-11)

### Features

- Update Webpack plugin to accept existing processor ([#535](https://github.com/tivac/modular-css/issues/535)) ([15f1e15](https://github.com/tivac/modular-css/commit/15f1e15))

# [19.1.0](https://github.com/tivac/modular-css/compare/v19.0.0...v19.1.0) (2019-01-10)

**Note:** Version bump only for package @modular-css/webpack

# [19.0.0](https://github.com/tivac/modular-css/compare/v18.0.0...v19.0.0) (2019-01-01)

**Note:** Version bump only for package @modular-css/webpack

# [18.0.0](https://github.com/tivac/modular-css/compare/v17.1.2...v18.0.0) (2018-12-22)

**Note:** Version bump only for package @modular-css/webpack

## [17.1.2](https://github.com/tivac/modular-css/compare/v17.1.1...v17.1.2) (2018-11-26)

**Note:** Version bump only for package @modular-css/webpack

## [17.1.1](https://github.com/tivac/modular-css/compare/v17.1.0...v17.1.1) (2018-11-08)

**Note:** Version bump only for package @modular-css/webpack

# [17.0.0](https://github.com/tivac/modular-css/compare/v16.2.0...v17.0.0) (2018-10-22)

**Note:** Version bump only for package @modular-css/webpack

# [16.2.0](https://github.com/tivac/modular-css/compare/v16.1.0...v16.2.0) (2018-10-12)

**Note:** Version bump only for package @modular-css/webpack

<a name="16.1.0"></a>

# [16.1.0](https://github.com/tivac/modular-css/compare/v16.0.0...v16.1.0) (2018-09-21)

**Note:** Version bump only for package @modular-css/webpack

<a name="16.0.0"></a>

# [16.0.0](https://github.com/tivac/modular-css/compare/v15.0.1...v16.0.0) (2018-09-01)

### Chores

- move all packages under modular-css org ([50341f7](https://github.com/tivac/modular-css/commit/50341f7))

### BREAKING CHANGES

- All package names have changed!

<a name="15.0.0"></a>

# [15.0.0](https://github.com/tivac/modular-css/compare/v14.4.0...v15.0.0) (2018-08-28)

**Note:** Version bump only for package modular-css-webpack

<a name="14.4.0"></a>

# [14.4.0](https://github.com/tivac/modular-css/compare/v14.3.0...v14.4.0) (2018-08-10)

**Note:** Version bump only for package modular-css-webpack

<a name="14.3.0"></a>

# [14.3.0](https://github.com/tivac/modular-css/compare/v14.2.1...v14.3.0) (2018-08-09)

**Note:** Version bump only for package modular-css-webpack

<a name="14.2.1"></a>

## [14.2.1](https://github.com/tivac/modular-css/compare/v14.2.0...v14.2.1) (2018-08-01)

**Note:** Version bump only for package modular-css-webpack

<a name="14.2.0"></a>

# [14.2.0](https://github.com/tivac/modular-css/compare/v14.1.0...v14.2.0) (2018-07-25)

**Note:** Version bump only for package modular-css-webpack

<a name="14.1.0"></a>

# [14.1.0](https://github.com/tivac/modular-css/compare/v14.0.1...v14.1.0) (2018-07-18)

**Note:** Version bump only for package modular-css-webpack

<a name="14.0.1"></a>

## [14.0.1](https://github.com/tivac/modular-css/compare/v14.0.0...v14.0.1) (2018-07-16)

**Note:** Version bump only for package modular-css-webpack

<a name="14.0.0"></a>

# [14.0.0](https://github.com/tivac/modular-css/compare/v13.0.0...v14.0.0) (2018-07-13)

**Note:** Version bump only for package modular-css-webpack

<a name="13.0.0"></a>

# [13.0.0](https://github.com/tivac/modular-css/compare/v12.1.3...v13.0.0) (2018-07-13)

### Bug Fixes

- Rollup rebuilds in watch mode ([#449](https://github.com/tivac/modular-css/issues/449)) ([d2eefec](https://github.com/tivac/modular-css/commit/d2eefec))

### BREAKING CHANGES

- `Processor.remove()` no longer removes the specified files AND their dependencies.

<a name="12.1.3"></a>

## [12.1.3](https://github.com/tivac/modular-css/compare/v12.1.2...v12.1.3) (2018-07-05)

**Note:** Version bump only for package modular-css-webpack

<a name="12.1.2"></a>

## [12.1.2](https://github.com/tivac/modular-css/compare/v12.1.0...v12.1.2) (2018-07-05)

**Note:** Version bump only for package modular-css-webpack

<a name="12.1.1"></a>

## [12.1.1](https://github.com/tivac/modular-css/compare/v12.1.0...v12.1.1) (2018-07-05)

**Note:** Version bump only for package modular-css-webpack

<a name="12.1.0"></a>

# [12.1.0](https://github.com/tivac/modular-css/compare/v12.0.2...v12.1.0) (2018-06-26)

**Note:** Version bump only for package modular-css-webpack

<a name="12.0.2"></a>

## [12.0.2](https://github.com/tivac/modular-css/compare/v12.0.1...v12.0.2) (2018-06-22)

**Note:** Version bump only for package modular-css-webpack

<a name="12.0.1"></a>

## [12.0.1](https://github.com/tivac/modular-css/compare/v12.0.0...v12.0.1) (2018-06-13)

**Note:** Version bump only for package modular-css-webpack

<a name="12.0.0"></a>

# [12.0.0](https://github.com/tivac/modular-css/compare/v11.0.0...v12.0.0) (2018-06-08)

**Note:** Version bump only for package modular-css-webpack

<a name="11.0.0"></a>

# [11.0.0](https://github.com/tivac/modular-css/compare/v10.1.0...v11.0.0) (2018-06-07)

**Note:** Version bump only for package modular-css-webpack

<a name="10.1.0"></a>

# [10.1.0](https://github.com/tivac/modular-css/compare/v10.0.0...v10.1.0) (2018-06-03)

**Note:** Version bump only for package modular-css-webpack

<a name="10.0.0"></a>

# [10.0.0](https://github.com/tivac/modular-css/compare/v9.0.0...v10.0.0) (2018-05-02)

### Bug Fixes

- adding new files w/ rollup shouldn't error ([#422](https://github.com/tivac/modular-css/issues/422)) ([67e1707](https://github.com/tivac/modular-css/commit/67e1707)), closes [#421](https://github.com/tivac/modular-css/issues/421)

### BREAKING CHANGES

- Processor.remove now always returns an array. If
  nothing was removed the array will be empty.

<a name="9.0.0"></a>

# [9.0.0](https://github.com/tivac/modular-css/compare/v8.2.0...v9.0.0) (2018-04-25)

**Note:** Version bump only for package modular-css-webpack

<a name="8.2.0"></a>

# [8.2.0](https://github.com/tivac/modular-css/compare/v8.1.1...v8.2.0) (2018-03-08)

### Bug Fixes

- webpack tests ([#414](https://github.com/tivac/modular-css/issues/414)) ([d240805](https://github.com/tivac/modular-css/commit/d240805)), closes [#413](https://github.com/tivac/modular-css/issues/413)

### Features

- webpack 4 support ([#413](https://github.com/tivac/modular-css/issues/413)) ([7b2f285](https://github.com/tivac/modular-css/commit/7b2f285))

<a name="8.1.0"></a>

# [8.1.0](https://github.com/tivac/modular-css/compare/v8.0.3...v8.1.0) (2018-02-21)

**Note:** Version bump only for package modular-css-webpack

<a name="8.0.3"></a>

## [8.0.3](https://github.com/tivac/modular-css/compare/v8.0.2...v8.0.3) (2018-02-21)

### Bug Fixes

- webpack inline maps should work ([#406](https://github.com/tivac/modular-css/issues/406)) ([f396866](https://github.com/tivac/modular-css/commit/f396866))

<a name="8.0.2"></a>

## [8.0.2](https://github.com/tivac/modular-css/compare/v8.0.0...v8.0.2) (2018-02-16)

### Bug Fixes

- Correctly support named exports of [@value](https://github.com/value) ([#399](https://github.com/tivac/modular-css/issues/399)) ([166bfb2](https://github.com/tivac/modular-css/commit/166bfb2))

<a name="8.0.0"></a>

# [8.0.0](https://github.com/tivac/modular-css/compare/v7.2.0...v8.0.0) (2018-02-09)

### Features

- Exporting values. ([#396](https://github.com/tivac/modular-css/issues/396)) ([#398](https://github.com/tivac/modular-css/issues/398)) ([4a15d8f](https://github.com/tivac/modular-css/commit/4a15d8f))
- External source maps ([#326](https://github.com/tivac/modular-css/issues/326)) ([8df5baa](https://github.com/tivac/modular-css/commit/8df5baa))

### BREAKING CHANGES

- Values will now be exported alongside composed classes

<a name="7.2.0"></a>

# [7.2.0](https://github.com/tivac/modular-css/compare/v7.1.0...v7.2.0) (2017-12-13)

**Note:** Version bump only for package modular-css-webpack

<a name="7.1.0"></a>

# [7.1.0](https://github.com/tivac/modular-css/compare/v7.0.0...v7.1.0) (2017-12-11)

### Features

- Svelte preprocess support ([#374](https://github.com/tivac/modular-css/issues/374)) ([0216a0c](https://github.com/tivac/modular-css/commit/0216a0c))

<a name="7.0.0"></a>

# [7.0.0](https://github.com/tivac/modular-css/compare/v6.1.0...v7.0.0) (2017-11-16)

**Note:** Version bump only for package modular-css-webpack
