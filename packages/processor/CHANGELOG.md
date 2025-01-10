# Change Log

## 29.0.4

### Patch Changes

- [#1022](https://github.com/tivac/modular-css/pull/1022) [`d9db40b`](https://github.com/tivac/modular-css/commit/d9db40b08355ec13b7929edcb27dd1bc58454513) Thanks [@tivac](https://github.com/tivac)! - fix: Properly replace `@values` inside of other `@values` when they're imported from another file (https://github.com/tivac/modular-css/issues/1020)

## 29.0.3

### Patch Changes

- [#983](https://github.com/tivac/modular-css/pull/983) [`63af4ac3`](https://github.com/tivac/modular-css/commit/63af4ac3ee6380ede5396463fb0305bc14274d84) Thanks [@tivac](https://github.com/tivac)! - Ensure that aliased values get exported, fixing #982

  ```
  @value * as values from "./other-file.css";
  @value local: values.somevalue;
  ```

  Previously that `local` value wouldn't exist in the JS exports, it was mistakenly treated like the `values` external value.

  Also adds semi-colons to variable declarations in the generated JS for vite/rollup/webpack.

## 29.0.2

### Patch Changes

- [#972](https://github.com/tivac/modular-css/pull/972) [`673df5d3`](https://github.com/tivac/modular-css/commit/673df5d345dead81f68eb6199757cfaf400f09a6) Thanks [@tivac](https://github.com/tivac)! - Improved vite integration, now correctly invalidating files when a file is changed or deleted.
  Improved invalidation in the processor, preventing stale `@value` or `composes` references from being output.

## 29.0.1

### Patch Changes

- [#965](https://github.com/tivac/modular-css/pull/965) [`edbbe96`](https://github.com/tivac/modular-css/commit/edbbe9667fa4333913bb95cd8c7e67f386f57054) Thanks [@tivac](https://github.com/tivac)! - Fix namespace import referencing via value aliases #964

  Updating internal `values` map after importing new values, which was missing previously.

- [#966](https://github.com/tivac/modular-css/pull/966) [`ffab76d`](https://github.com/tivac/modular-css/commit/ffab76d4428211ba33e6f7a6d518618b5cfdef00) Thanks [@tivac](https://github.com/tivac)! - only .toString() if dirty when replacing `@value` references

## 29.0.0

### Major Changes

- [#926](https://github.com/tivac/modular-css/pull/926) [`a61fa35`](https://github.com/tivac/modular-css/commit/a61fa35f81e0c5c181c425e596c27f017acd5096) Thanks [@tivac](https://github.com/tivac)! - Errors will be reported for more invalid uses of `composes:`

  ```css
  .fooga {
    color: red;
  }

  /* ✅ still valid  */
  .wooga {
    composes: fooga;
  }

  /* 🚫, previously reported */
  .wooga .tooga {
    composes: fooga;
  }

  /* 🚫, previously reported */
  .wooga.tooga {
    composes: fooga;
  }

  /* 🆕🚫, previously silently ignored */
  html {
    composes: fooga;
  }

  /* 🆕🚫, previously acted like .class */
  .class:focus {
    composes: fooga;
  }

  /* 🆕🚫, previously acted like .class */
  .class::after {
    composes: fooga;
  }

  /* 🆕🚫, previously acted like .class */
  @media (min-width: 800px) {
    .class {
      composes: fooga;
    }
  }
  ```

  The most likely breaking change will be the removal of pseudo selectors as valid. Previously classes with a pseudo were treated as though the pseudo didn't exist. If you have class selectors that contain a pseudo that need to use `composes` the suggested workaround is something like this:

  ```css
  .fooga {
    color: red;
  }

  /* BEFORE */
  .wooga,
  .wooga:active {
    composes: fooga;

    background: blue;
  }

  /* AFTER */
  .wooga {
    composes: fooga;
  }

  .wooga,
  .wooga:active {
    background: blue;
  }
  ```

## 28.1.5

### Patch Changes

- [#892](https://github.com/tivac/modular-css/pull/892) [`8983ec7`](https://github.com/tivac/modular-css/commit/8983ec74fe945f2859c4078e66ef15095a75f9be) Thanks [@plesiecki](https://github.com/plesiecki)! - Fix an issue where composition information could be returned out of order

## 28.1.4

### Patch Changes

- [#890](https://github.com/tivac/modular-css/pull/890) [`daa9c53`](https://github.com/tivac/modular-css/commit/daa9c535e19f434e651fcbbbaf7cf48fa7b481ae) Thanks [@plesiecki](https://github.com/plesiecki)! - Improve consistency of composition map by ensuring that both forms of `composes` declaration correctly order the classes.

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [28.1.3](https://github.com/tivac/modular-css/compare/v28.1.2...v28.1.3) (2022-06-15)

**Note:** Version bump only for package @modular-css/processor

# [28.0.0](https://github.com/tivac/modular-css/compare/v27.2.0...v28.0.0) (2022-02-25)

**Note:** Version bump only for package @modular-css/processor

# [27.1.0](https://github.com/tivac/modular-css/compare/v27.0.3...v27.1.0) (2022-02-03)

### Bug Fixes

- **processor:** cleaning up ([897a2c5](https://github.com/tivac/modular-css/commit/897a2c52acc1b507452654c48360e469e2468a69))

### Features

- **vite:** vite plugin ([46c80da](https://github.com/tivac/modular-css/commit/46c80dab3c552b5ddf2c43683984d6c9112ecd39))
- **www:** m-css.com on sveltekit ([d434f92](https://github.com/tivac/modular-css/commit/d434f927a4201df8d66cd7ed5ea2be63daa42b7a))

## [27.0.3](https://github.com/tivac/modular-css/compare/v26.0.0...v27.0.3) (2021-12-17)

### Code Refactoring

- postcss8 native support ([#795](https://github.com/tivac/modular-css/issues/795)) ([331b833](https://github.com/tivac/modular-css/commit/331b833e8de6a4f952be0735441c5d7589aa2ed0))

### BREAKING CHANGES

- - Only supports `postcss@8` and higher

* `composes` and `@values` that reference other entries will need to be listed in dependency order.

## [27.0.2](https://github.com/tivac/modular-css/compare/v27.0.1...v27.0.2) (2021-07-18)

### Bug Fixes

- support complex [@value](https://github.com/value) replacements ([06eb52c](https://github.com/tivac/modular-css/commit/06eb52ccf63ca6de2828d50abded6b79070e1e4d))

## [27.0.1](https://github.com/tivac/modular-css/compare/v27.0.0...v27.0.1) (2021-07-18)

### Bug Fixes

- local references as references ([aeba154](https://github.com/tivac/modular-css/commit/aeba154d07e53c76643f2838621a30c4dcec0c36))

# [27.0.0](https://github.com/tivac/modular-css/compare/v26.0.0...v27.0.0) (2021-07-06)

### Bug Fixes

- [@composes](https://github.com/composes) working again ([f48bc5f](https://github.com/tivac/modular-css/commit/f48bc5f9b6515c9fa7ce4581258ba02fa58f05b7))
- [@keyframes](https://github.com/keyframes) can be anywhere ([b6dddc7](https://github.com/tivac/modular-css/commit/b6dddc759233f7148f0add32104a23c41d923a19))

### Code Refactoring

- remove postcss as dep ([ca67c39](https://github.com/tivac/modular-css/commit/ca67c39dee4b98e0528e2543e556e735f2ed8bf8))

### Features

- Add .warnings to processor ([eb0e117](https://github.com/tivac/modular-css/commit/eb0e1174ea10892d396c87298508bba1acd233ae))

### BREAKING CHANGES

- - Requires `postcss@8` be installed alongside to function.

# [26.0.0](https://github.com/tivac/modular-css/compare/v25.8.2...v26.0.0) (2021-02-25)

### Features

- fine-grained dependency tracking ([597ae42](https://github.com/tivac/modular-css/commit/597ae42183b4c15bee368609a84e4e991b497e30))
- postcss@8 support ([#789](https://github.com/tivac/modular-css/issues/789)) ([340a38e](https://github.com/tivac/modular-css/commit/340a38e45bbb64d2e1ee7fc82882995383466bd3))

### BREAKING CHANGES

- postcss@8 drops support for node version 6.x, 8.x, 11.x, and 13.x.

## [25.8.2](https://github.com/tivac/modular-css/compare/v25.8.1...v25.8.2) (2020-09-02)

### Bug Fixes

- **processor:** don't scope [@keyframes](https://github.com/keyframes) contents ([#781](https://github.com/tivac/modular-css/issues/781)) ([dd41bf1](https://github.com/tivac/modular-css/commit/dd41bf111158be235fa50c52d10c6ca203994e4f))

# [25.8.0](https://github.com/tivac/modular-css/compare/v25.7.0...v25.8.0) (2020-06-29)

### Bug Fixes

- remove rule if there's no other decls ([#769](https://github.com/tivac/modular-css/issues/769)) ([9215873](https://github.com/tivac/modular-css/commit/92158730cb38947ed8aba03e1b6fa56501a711f0))

### Features

- **svelte:** warn on non ".css" <link href> ([#766](https://github.com/tivac/modular-css/issues/766)) ([1ac0e4d](https://github.com/tivac/modular-css/commit/1ac0e4dde2f995f3b422d1d14bbece066c2704f9))

# [25.7.0](https://github.com/tivac/modular-css/compare/v25.6.0...v25.7.0) (2020-05-15)

### Features

- Support escaped characters in composed class names ([#755](https://github.com/tivac/modular-css/issues/755)) ([6cd4d8a](https://github.com/tivac/modular-css/commit/6cd4d8acc16abc9ac51c778a0b7f42a4c07088e4))

# [25.6.0](https://github.com/tivac/modular-css/compare/v25.4.1...v25.6.0) (2020-04-21)

### Bug Fixes

- **processor:** better error :external can't find a file ([469c859](https://github.com/tivac/modular-css/commit/469c8597d0535a2e1b723ee8ebb974326cddefdb))
- **processor:** better error when importing missing [@value](https://github.com/value) ([0d06afa](https://github.com/tivac/modular-css/commit/0d06afa675808847769b00e9e35c29961494193c))

### Features

- **core:** Add support for aliasing values ([#737](https://github.com/tivac/modular-css/issues/737)) ([597c1ae](https://github.com/tivac/modular-css/commit/597c1aec95ae6c8bec584d862df17a44921dfa6d)), closes [#719](https://github.com/tivac/modular-css/issues/719) [#736](https://github.com/tivac/modular-css/issues/736)
- **website:** port site to svelte3 ([35e7a96](https://github.com/tivac/modular-css/commit/35e7a9677d700772cb6f9a06e35d2b14b0283494))

# [25.5.0](https://github.com/tivac/modular-css/compare/v25.4.1...v25.5.0) (2020-03-09)

### Bug Fixes

- **processor:** better error :external can't find a file ([469c859](https://github.com/tivac/modular-css/commit/469c8597d0535a2e1b723ee8ebb974326cddefdb))
- **processor:** better error when importing missing [@value](https://github.com/value) ([0d06afa](https://github.com/tivac/modular-css/commit/0d06afa675808847769b00e9e35c29961494193c))

### Features

- **website:** port site to svelte3 ([35e7a96](https://github.com/tivac/modular-css/commit/35e7a9677d700772cb6f9a06e35d2b14b0283494))

## [25.4.1](https://github.com/tivac/modular-css/compare/v25.4.0...v25.4.1) (2020-02-12)

**Note:** Version bump only for package @modular-css/processor

# [25.4.0](https://github.com/tivac/modular-css/compare/v25.3.1...v25.4.0) (2020-02-05)

### Features

- add `.root()` to avoid re-parsing inputs when possible ([#717](https://github.com/tivac/modular-css/issues/717)) ([fdb010b](https://github.com/tivac/modular-css/commit/fdb010b))

## [25.3.1](https://github.com/tivac/modular-css/compare/v25.3.0...v25.3.1) (2020-01-23)

### Bug Fixes

- **processor:** don't assume `plugin` key on messages ([#712](https://github.com/tivac/modular-css/issues/712)) ([3a5279c](https://github.com/tivac/modular-css/commit/3a5279c))

# [25.2.0](https://github.com/tivac/modular-css/compare/v25.1.0...v25.2.0) (2019-10-30)

### Features

- Custom file reader api ([#671](https://github.com/tivac/modular-css/issues/671)) ([f1865c9](https://github.com/tivac/modular-css/commit/f1865c9))
- **processor:** add processor.resolve() ([#681](https://github.com/tivac/modular-css/issues/681)) ([2c5a51d](https://github.com/tivac/modular-css/commit/2c5a51d)), closes [#679](https://github.com/tivac/modular-css/issues/679)

# [25.1.0](https://github.com/tivac/modular-css/compare/v25.0.0...v25.1.0) (2019-09-23)

### Features

- option to suppress value export ([#673](https://github.com/tivac/modular-css/issues/673)) ([97a5b1e](https://github.com/tivac/modular-css/commit/97a5b1e)), closes [#672](https://github.com/tivac/modular-css/issues/672)

# [25.0.0](https://github.com/tivac/modular-css/compare/v24.2.2...v25.0.0) (2019-09-16)

### Features

- support from global for composes ([#669](https://github.com/tivac/modular-css/issues/669)) ([0a7996e](https://github.com/tivac/modular-css/commit/0a7996e))
- **processor:** allow composes anywhere in a rule ([#646](https://github.com/tivac/modular-css/issues/646)) ([31b57a2](https://github.com/tivac/modular-css/commit/31b57a2)), closes [#645](https://github.com/tivac/modular-css/issues/645)

### BREAKING CHANGES

- **processor:** previously `modular-css` would require that `composes` be the first declaration in a rule. This restriction has been removed due to better solutions for enforcing that behavior existing now (stylelint-order).

## [24.2.2](https://github.com/tivac/modular-css/compare/v24.2.0...v24.2.2) (2019-07-08)

### Bug Fixes

- generate parsers before publishing ([2c72008](https://github.com/tivac/modular-css/commit/2c72008))

# [24.2.0](https://github.com/tivac/modular-css/compare/v24.1.0...v24.2.0) (2019-07-06)

### Features

- composes at-rule ([#635](https://github.com/tivac/modular-css/issues/635)) ([27d696a](https://github.com/tivac/modular-css/commit/27d696a)), closes [#633](https://github.com/tivac/modular-css/issues/633)

# [24.1.0](https://github.com/tivac/modular-css/compare/v24.0.1...v24.1.0) (2019-06-17)

**Note:** Version bump only for package @modular-css/processor

## [24.0.1](https://github.com/tivac/modular-css/compare/v24.0.0...v24.0.1) (2019-05-29)

**Note:** Version bump only for package @modular-css/processor

# [24.0.0](https://github.com/tivac/modular-css/compare/v23.0.6...v24.0.0) (2019-05-08)

### Code Refactoring

- **processor:** add dupewarn option and no longer resolve path case ([#582](https://github.com/tivac/modular-css/issues/582)) ([01581f9](https://github.com/tivac/modular-css/commit/01581f9)), closes [#581](https://github.com/tivac/modular-css/issues/581)

### BREAKING CHANGES

- **processor:** It was causing massive slowdowns to synchronously resolve files using `true-case-path`, and making it async wasn't a guaranteed win either. So it's removed, which should solve #581 pretty neatly. Instead now there's a warning if two files are included that differ in case only. It can be disabled by setting `dupewarn : false` as part of the config object.

## [23.0.4](https://github.com/tivac/modular-css/compare/v23.0.3...v23.0.4) (2019-04-03)

**Note:** Version bump only for package @modular-css/processor

# [23.0.0](https://github.com/tivac/modular-css/compare/v22.3.0...v23.0.0) (2019-03-28)

### Bug Fixes

- walk invalidated dependencies ([#573](https://github.com/tivac/modular-css/issues/573)) ([0284b11](https://github.com/tivac/modular-css/commit/0284b11)), closes [#532](https://github.com/tivac/modular-css/issues/532)

### Features

- replacing missing css.fooga with stringified version ([#574](https://github.com/tivac/modular-css/issues/574)) ([2084b62](https://github.com/tivac/modular-css/commit/2084b62))

### BREAKING CHANGES

- Previously missing css.fooga references would be left as-is, now they're wrapped in quotes to prevent them from causing JS errors. If you want missing classes to break things you should enable strict mode. Also no longer injecting a `<script>` block just to import css if there isn't already a `<script>` block defined in the module.

## [22.1.4](https://github.com/tivac/modular-css/compare/v22.1.3...v22.1.4) (2019-02-16)

### Bug Fixes

- add homepage & repo directory fields ([f9c1606](https://github.com/tivac/modular-css/commit/f9c1606))

## [22.1.2](https://github.com/tivac/modular-css/compare/v22.1.1...v22.1.2) (2019-02-09)

### Bug Fixes

- dependency processing race condition ([#565](https://github.com/tivac/modular-css/issues/565)) ([436c1c8](https://github.com/tivac/modular-css/commit/436c1c8))

# [22.1.0](https://github.com/tivac/modular-css/compare/v22.0.2...v22.1.0) (2019-02-06)

### Bug Fixes

- log file invalidations ([0b1476e](https://github.com/tivac/modular-css/commit/0b1476e))
- remove newlines after composes ([#561](https://github.com/tivac/modular-css/issues/561)) ([23569dc](https://github.com/tivac/modular-css/commit/23569dc))

### Features

- processor.normalize() & corrected chunking logic ([#562](https://github.com/tivac/modular-css/issues/562)) ([e0c5eee](https://github.com/tivac/modular-css/commit/e0c5eee)), closes [#559](https://github.com/tivac/modular-css/issues/559) [#560](https://github.com/tivac/modular-css/issues/560)

## [22.0.1](https://github.com/tivac/modular-css/compare/v22.0.0...v22.0.1) (2019-01-27)

### Bug Fixes

- ignore external modules ([#555](https://github.com/tivac/modular-css/issues/555)) ([5a6fcd9](https://github.com/tivac/modular-css/commit/5a6fcd9))

# [22.0.0](https://github.com/tivac/modular-css/compare/v21.2.1...v22.0.0) (2019-01-25)

**Note:** Version bump only for package @modular-css/processor

# [21.2.0](https://github.com/tivac/modular-css/compare/v21.1.2...v21.2.0) (2019-01-24)

### Bug Fixes

- use a safer regex for finding [@values](https://github.com/values) ([#552](https://github.com/tivac/modular-css/issues/552)) ([c6a684c](https://github.com/tivac/modular-css/commit/c6a684c)), closes [#548](https://github.com/tivac/modular-css/issues/548)

### Features

- support postcss process options ([#551](https://github.com/tivac/modular-css/issues/551)) ([86d6d68](https://github.com/tivac/modular-css/commit/86d6d68)), closes [#550](https://github.com/tivac/modular-css/issues/550)

## [21.1.1](https://github.com/tivac/modular-css/compare/v21.1.0...v21.1.1) (2019-01-21)

**Note:** Version bump only for package @modular-css/processor

# [21.0.0](https://github.com/tivac/modular-css/compare/v20.0.1...v21.0.0) (2019-01-18)

**Note:** Version bump only for package @modular-css/processor

# [20.0.0](https://github.com/tivac/modular-css/compare/v19.2.0...v20.0.0) (2019-01-15)

### Bug Fixes

- package fixes ([e03d3b7](https://github.com/tivac/modular-css/commit/e03d3b7))

# [19.1.0](https://github.com/tivac/modular-css/compare/v19.0.0...v19.1.0) (2019-01-10)

### Bug Fixes

- better error if resolver returns bad file ([513c2a9](https://github.com/tivac/modular-css/commit/513c2a9))
- remove random async from processor.string ([d5ca5c0](https://github.com/tivac/modular-css/commit/d5ca5c0))

### Features

- add processor.has to check for known files ([df5ac6f](https://github.com/tivac/modular-css/commit/df5ac6f))

# [19.0.0](https://github.com/tivac/modular-css/compare/v18.0.0...v19.0.0) (2019-01-01)

### Features

- Rollup@1.0 support ([#532](https://github.com/tivac/modular-css/issues/532)) ([1fab777](https://github.com/tivac/modular-css/commit/1fab777))

### BREAKING CHANGES

- requires rollup@1.0

# [18.0.0](https://github.com/tivac/modular-css/compare/v17.1.2...v18.0.0) (2018-12-22)

### Features

- Rework rollup support ([#531](https://github.com/tivac/modular-css/issues/531)) ([fce87fe](https://github.com/tivac/modular-css/commit/fce87fe))

### BREAKING CHANGES

- changed rollup plugin CSS output so it better matches rollup output chunk format & bumped minimum rollup version to 0.68.0

## [17.1.2](https://github.com/tivac/modular-css/compare/v17.1.1...v17.1.2) (2018-11-26)

### Bug Fixes

- path casing ([#528](https://github.com/tivac/modular-css/issues/528)) ([2d4af90](https://github.com/tivac/modular-css/commit/2d4af90))

## [17.1.1](https://github.com/tivac/modular-css/compare/v17.1.0...v17.1.1) (2018-11-08)

**Note:** Version bump only for package @modular-css/processor

# [17.0.0](https://github.com/tivac/modular-css/compare/v16.2.0...v17.0.0) (2018-10-22)

**Note:** Version bump only for package @modular-css/processor

# [16.2.0](https://github.com/tivac/modular-css/compare/v16.1.0...v16.2.0) (2018-10-12)

### Features

- Add verbose option to rollup & svelte ([#521](https://github.com/tivac/modular-css/issues/521)) ([0706e3d](https://github.com/tivac/modular-css/commit/0706e3d)), closes [#520](https://github.com/tivac/modular-css/issues/520)

<a name="16.1.0"></a>

# [16.1.0](https://github.com/tivac/modular-css/compare/v16.0.0...v16.1.0) (2018-09-21)

**Note:** Version bump only for package @modular-css/processor

<a name="16.0.0"></a>

# [16.0.0](https://github.com/tivac/modular-css/compare/v15.0.1...v16.0.0) (2018-09-01)

**Note:** Version bump only for package @modular-css/processor

<a name="15.0.0"></a>

# [15.0.0](https://github.com/tivac/modular-css/compare/v14.4.0...v15.0.0) (2018-08-28)

### Bug Fixes

- **deps:** update dependency postcss-url to v8 ([#497](https://github.com/tivac/modular-css/issues/497)) ([b270db5](https://github.com/tivac/modular-css/commit/b270db5))
- run after plugins against files serially ([#508](https://github.com/tivac/modular-css/issues/508)) ([14bae1d](https://github.com/tivac/modular-css/commit/14bae1d))

### BREAKING CHANGES

- `Processor` instances must be instantiated with `new`, they're no longer auto-instantiating

<a name="14.4.0"></a>

# [14.4.0](https://github.com/tivac/modular-css/compare/v14.3.0...v14.4.0) (2018-08-10)

**Note:** Version bump only for package modular-css-core

<a name="14.3.0"></a>

# [14.3.0](https://github.com/tivac/modular-css/compare/v14.2.1...v14.3.0) (2018-08-09)

### Features

- verbose logging option ([#465](https://github.com/tivac/modular-css/issues/465)) ([5238ade](https://github.com/tivac/modular-css/commit/5238ade))

<a name="14.2.1"></a>

## [14.2.1](https://github.com/tivac/modular-css/compare/v14.2.0...v14.2.1) (2018-08-01)

**Note:** Version bump only for package modular-css-core

<a name="14.2.0"></a>

# [14.2.0](https://github.com/tivac/modular-css/compare/v14.1.0...v14.2.0) (2018-07-25)

**Note:** Version bump only for package modular-css-core

<a name="14.1.0"></a>

# [14.1.0](https://github.com/tivac/modular-css/compare/v14.0.1...v14.1.0) (2018-07-18)

**Note:** Version bump only for package modular-css-core

<a name="14.0.1"></a>

## [14.0.1](https://github.com/tivac/modular-css/compare/v14.0.0...v14.0.1) (2018-07-16)

### Bug Fixes

- remove lodash.uniq usage ([d995217](https://github.com/tivac/modular-css/commit/d995217)), closes [#452](https://github.com/tivac/modular-css/issues/452)

<a name="14.0.0"></a>

# [14.0.0](https://github.com/tivac/modular-css/compare/v13.0.0...v14.0.0) (2018-07-13)

**Note:** Version bump only for package modular-css-core

<a name="13.0.0"></a>

# [13.0.0](https://github.com/tivac/modular-css/compare/v12.1.3...v13.0.0) (2018-07-13)

### Bug Fixes

- Rollup rebuilds in watch mode ([#449](https://github.com/tivac/modular-css/issues/449)) ([d2eefec](https://github.com/tivac/modular-css/commit/d2eefec))

### BREAKING CHANGES

- `Processor.remove()` no longer removes the specified files AND their dependencies.

<a name="12.1.3"></a>

## [12.1.3](https://github.com/tivac/modular-css/compare/v12.1.2...v12.1.3) (2018-07-05)

**Note:** Version bump only for package modular-css-core

<a name="12.1.2"></a>

## [12.1.2](https://github.com/tivac/modular-css/compare/v12.1.0...v12.1.2) (2018-07-05)

**Note:** Version bump only for package modular-css-core

<a name="12.1.1"></a>

## [12.1.1](https://github.com/tivac/modular-css/compare/v12.1.0...v12.1.1) (2018-07-05)

**Note:** Version bump only for package modular-css-core

<a name="12.1.0"></a>

# [12.1.0](https://github.com/tivac/modular-css/compare/v12.0.2...v12.1.0) (2018-06-26)

**Note:** Version bump only for package modular-css-core

<a name="12.0.2"></a>

## [12.0.2](https://github.com/tivac/modular-css/compare/v12.0.1...v12.0.2) (2018-06-22)

**Note:** Version bump only for package modular-css-core

<a name="12.0.1"></a>

## [12.0.1](https://github.com/tivac/modular-css/compare/v12.0.0...v12.0.1) (2018-06-13)

**Note:** Version bump only for package modular-css-core

<a name="12.0.0"></a>

# [12.0.0](https://github.com/tivac/modular-css/compare/v11.0.0...v12.0.0) (2018-06-08)

**Note:** Version bump only for package modular-css-core

<a name="11.0.0"></a>

# [11.0.0](https://github.com/tivac/modular-css/compare/v10.1.0...v11.0.0) (2018-06-07)

**Note:** Version bump only for package modular-css-core

<a name="10.1.0"></a>

# [10.1.0](https://github.com/tivac/modular-css/compare/v10.0.0...v10.1.0) (2018-06-03)

**Note:** Version bump only for package modular-css-core

<a name="10.0.0"></a>

# [10.0.0](https://github.com/tivac/modular-css/compare/v9.0.0...v10.0.0) (2018-05-02)

### Bug Fixes

- adding new files w/ rollup shouldn't error ([#422](https://github.com/tivac/modular-css/issues/422)) ([67e1707](https://github.com/tivac/modular-css/commit/67e1707)), closes [#421](https://github.com/tivac/modular-css/issues/421)

### BREAKING CHANGES

- Processor.remove now always returns an array. If
  nothing was removed the array will be empty.

<a name="9.0.0"></a>

# [9.0.0](https://github.com/tivac/modular-css/compare/v8.2.0...v9.0.0) (2018-04-25)

**Note:** Version bump only for package modular-css-core

<a name="8.1.0"></a>

# [8.1.0](https://github.com/tivac/modular-css/compare/v8.0.3...v8.1.0) (2018-02-21)

### Features

- Allow plugin exports via "processing" lifecycle hook ([#404](https://github.com/tivac/modular-css/issues/404)) ([72a89de](https://github.com/tivac/modular-css/commit/72a89de)), closes [#401](https://github.com/tivac/modular-css/issues/401)

<a name="8.0.0"></a>

# [8.0.0](https://github.com/tivac/modular-css/compare/v7.2.0...v8.0.0) (2018-02-09)

### Features

- Exporting values. ([#396](https://github.com/tivac/modular-css/issues/396)) ([#398](https://github.com/tivac/modular-css/issues/398)) ([4a15d8f](https://github.com/tivac/modular-css/commit/4a15d8f))
- External source maps ([#326](https://github.com/tivac/modular-css/issues/326)) ([8df5baa](https://github.com/tivac/modular-css/commit/8df5baa))

### BREAKING CHANGES

- Values will now be exported alongside composed classes

<a name="7.2.0"></a>

# [7.2.0](https://github.com/tivac/modular-css/compare/v7.1.0...v7.2.0) (2017-12-13)

### Features

- **modular-css-core:** processor.remove returns removed files ([#376](https://github.com/tivac/modular-css/issues/376)) ([b560651](https://github.com/tivac/modular-css/commit/b560651))

<a name="7.0.0"></a>

# [7.0.0](https://github.com/tivac/modular-css/compare/v6.1.0...v7.0.0) (2017-11-16)

### Bug Fixes

- Overlapping value replacement ([#365](https://github.com/tivac/modular-css/issues/365)) ([1f6fdb5](https://github.com/tivac/modular-css/commit/1f6fdb5)), closes [#363](https://github.com/tivac/modular-css/issues/363)

### Features

- add rewrite option ([#368](https://github.com/tivac/modular-css/issues/368)) ([9bae543](https://github.com/tivac/modular-css/commit/9bae543))

### BREAKING CHANGES

- To prevent `postcss-url` from running you now specify `rewrite: false` instead of defining an `after` segment.
