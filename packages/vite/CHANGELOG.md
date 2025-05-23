# Change Log

## 30.2.1

### Patch Changes

- Updated dependencies [[`21ac173`](https://github.com/tivac/modular-css/commit/21ac173110efaaac2aad503a1d5b6079b820000e)]:
  - @modular-css/css-to-js@29.1.1

## 30.2.0

### Minor Changes

- [#1040](https://github.com/tivac/modular-css/pull/1040) [`17b6ae2`](https://github.com/tivac/modular-css/commit/17b6ae2a4e8dcd2d3a6a3e01364dd55d3ac7b0ec) Thanks [@tivac](https://github.com/tivac)! - ## CSS coverage & warnings on unused classes

  Added `dev.warn` and `dev.coverage` as supported options for `@modular-css/css-to-js` package, and by extension `@modular-css/rollup`, `@modular-css/vite`, and `@modular-css/webpack`.

  `dev.warn` will cause unknown classes requested from JS to log a warning to the console, instead of the current errors that are thrown.

  `dev.coverage` will cause a global named `mcssCoverage` to be created which will track accesses of all exported classes per file and allow you to identify unused styles.

  Example of a `mcssCoverage` object

  ```js
  {
      "packages/vite/tests/specimens/shared/static-c.mcss" : { c : 0 },
      "packages/vite/tests/specimens/static/a.mcss" : { a : 1 },
      "packages/vite/tests/specimens/static/b.mcss" : { b : 1 },
  }
  ```

### Patch Changes

- Updated dependencies [[`17b6ae2`](https://github.com/tivac/modular-css/commit/17b6ae2a4e8dcd2d3a6a3e01364dd55d3ac7b0ec)]:
  - @modular-css/css-to-js@29.1.0

## 30.1.1

### Patch Changes

- [#1026](https://github.com/tivac/modular-css/pull/1026) [`b57b255`](https://github.com/tivac/modular-css/commit/b57b2556fc2389082950b5175d1d85a189891a4e) Thanks [@tivac](https://github.com/tivac)! - Remove tests from published package

## 30.1.0

### Minor Changes

- [#1024](https://github.com/tivac/modular-css/pull/1024) [`1c9322f`](https://github.com/tivac/modular-css/commit/1c9322fd9a39d05da01df8a8c6bd43e9218f9df1) Thanks [@tivac](https://github.com/tivac)! - Vite 6 support

## 30.0.6

### Patch Changes

- Updated dependencies [[`d9db40b`](https://github.com/tivac/modular-css/commit/d9db40b08355ec13b7929edcb27dd1bc58454513)]:
  - @modular-css/processor@29.0.4
  - @modular-css/css-to-js@29.0.6

## 30.0.5

### Patch Changes

- Updated dependencies [[`e7e8249`](https://github.com/tivac/modular-css/commit/e7e8249b780320ace068b854fbd9dd8e2591de2c)]:
  - @modular-css/css-to-js@29.0.5

## 30.0.4

### Patch Changes

- [#998](https://github.com/tivac/modular-css/pull/998) [`5fa92ea`](https://github.com/tivac/modular-css/commit/5fa92ea620a698fa7238b67f7f604da00be8b776) Thanks [@tivac](https://github.com/tivac)! - Update `peerDependencies` to support `vite@5`

## 30.0.3

### Patch Changes

- Updated dependencies [[`63af4ac3`](https://github.com/tivac/modular-css/commit/63af4ac3ee6380ede5396463fb0305bc14274d84)]:
  - @modular-css/css-to-js@29.0.3
  - @modular-css/processor@29.0.3

## 30.0.2

### Patch Changes

- [#972](https://github.com/tivac/modular-css/pull/972) [`673df5d3`](https://github.com/tivac/modular-css/commit/673df5d345dead81f68eb6199757cfaf400f09a6) Thanks [@tivac](https://github.com/tivac)! - Improved vite integration, now correctly invalidating files when a file is changed or deleted.
  Improved invalidation in the processor, preventing stale `@value` or `composes` references from being output.
- Updated dependencies [[`673df5d3`](https://github.com/tivac/modular-css/commit/673df5d345dead81f68eb6199757cfaf400f09a6)]:
  - @modular-css/processor@29.0.2
  - @modular-css/css-to-js@29.0.2

## 30.0.1

### Patch Changes

- Updated dependencies [[`edbbe96`](https://github.com/tivac/modular-css/commit/edbbe9667fa4333913bb95cd8c7e67f386f57054), [`ffab76d`](https://github.com/tivac/modular-css/commit/ffab76d4428211ba33e6f7a6d518618b5cfdef00)]:
  - @modular-css/processor@29.0.1
  - @modular-css/css-to-js@29.0.1

## 30.0.0

### Major Changes

- [`7488bb1`](https://github.com/tivac/modular-css/commit/7488bb12add1175e8c5a1be59ca97ea8207a9d98) Thanks [@tivac](https://github.com/tivac)! - All the various interfaces to `@modular-css/processor` need to be updated because of the breaking changes to composition rules in #926

### Patch Changes

- Updated dependencies [[`7488bb1`](https://github.com/tivac/modular-css/commit/7488bb12add1175e8c5a1be59ca97ea8207a9d98), [`a61fa35`](https://github.com/tivac/modular-css/commit/a61fa35f81e0c5c181c425e596c27f017acd5096)]:
  - @modular-css/css-to-js@29.0.0
  - @modular-css/processor@29.0.0

## 29.1.3

### Patch Changes

- [#919](https://github.com/tivac/modular-css/pull/919) [`989d1f0`](https://github.com/tivac/modular-css/commit/989d1f06caf0505d7cc7bfee52f29afd5a0a7760) Thanks [@tivac](https://github.com/tivac)! - Vite 4 support

## 29.1.2

### Patch Changes

- Updated dependencies [[`8983ec7`](https://github.com/tivac/modular-css/commit/8983ec74fe945f2859c4078e66ef15095a75f9be)]:
  - @modular-css/processor@28.1.5
  - @modular-css/css-to-js@28.4.1

## 29.1.1

### Patch Changes

- Updated dependencies [[`6211b85`](https://github.com/tivac/modular-css/commit/6211b859abf83f95ffcce0d741d9e82628f97eb5)]:
  - @modular-css/css-to-js@28.4.0

## 29.1.0

### Minor Changes

- [#901](https://github.com/tivac/modular-css/pull/901) [`02bc885`](https://github.com/tivac/modular-css/commit/02bc88570045be3e6e23adff5411b6ad1883d104) Thanks [@plesiecki](https://github.com/plesiecki)! - New option to change type of variable declaration — `variableDeclaration` which defaults to `const`. Can be set to `var` if necessary, e.g. ES5 support.

### Patch Changes

- Updated dependencies [[`02bc885`](https://github.com/tivac/modular-css/commit/02bc88570045be3e6e23adff5411b6ad1883d104)]:
  - @modular-css/css-to-js@28.3.0

## 29.0.2

### Patch Changes

- Updated dependencies [[`b1af909`](https://github.com/tivac/modular-css/commit/b1af909ceaa2dbc4b54c376b9ed5a14a824c6e89)]:
  - @modular-css/css-to-js@28.2.4

## 29.0.1

### Patch Changes

- Updated dependencies [[`daa9c53`](https://github.com/tivac/modular-css/commit/daa9c535e19f434e651fcbbbaf7cf48fa7b481ae)]:
  - @modular-css/processor@28.1.4
  - @modular-css/css-to-js@28.2.3

## 29.0.0

### Major Changes

- [#874](https://github.com/tivac/modular-css/pull/874) [`65cc277`](https://github.com/tivac/modular-css/commit/65cc2775976570ad50c483abef664483f2b7edf9) Thanks [@Morklympious](https://github.com/Morklympious)! - Updated to support `vite@3`, but now no longer supports `vite@2` due to an API incompatibility between the versions.

  If you want to use `@modular-css/vite` with `vite@2` you'll need to stay on `@modular-css/vite@28.2.2`.

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

**Note:** Version bump only for package @modular-css/vite

## [28.1.4](https://github.com/tivac/modular-css/compare/v28.1.3...v28.1.4) (2022-06-16)

**Note:** Version bump only for package @modular-css/vite

## [28.1.3](https://github.com/tivac/modular-css/compare/v28.1.2...v28.1.3) (2022-06-15)

**Note:** Version bump only for package @modular-css/vite

## [28.1.2](https://github.com/tivac/modular-css/compare/v28.1.1...v28.1.2) (2022-05-25)

**Note:** Version bump only for package @modular-css/vite

## [28.1.1](https://github.com/tivac/modular-css/compare/v28.1.0...v28.1.1) (2022-04-08)

**Note:** Version bump only for package @modular-css/vite

# [28.0.0](https://github.com/tivac/modular-css/compare/v27.2.0...v28.0.0) (2022-02-25)

**Note:** Version bump only for package @modular-css/vite

## [27.1.1](https://github.com/tivac/modular-css/compare/v27.1.0...v27.1.1) (2022-02-09)

### Bug Fixes

- **vite:** non-win32 file resolution ([#809](https://github.com/tivac/modular-css/issues/809)) ([115c517](https://github.com/tivac/modular-css/commit/115c517ca5f4586619db2207d1d37675981237c6))

# [27.1.0](https://github.com/tivac/modular-css/compare/v27.0.3...v27.1.0) (2022-02-03)

### Features

- **vite:** vite plugin ([46c80da](https://github.com/tivac/modular-css/commit/46c80dab3c552b5ddf2c43683984d6c9112ecd39))
- **www:** m-css.com on sveltekit ([d434f92](https://github.com/tivac/modular-css/commit/d434f927a4201df8d66cd7ed5ea2be63daa42b7a))
