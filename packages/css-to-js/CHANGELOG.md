# Change Log

## 29.0.1

### Patch Changes

- Updated dependencies [[`edbbe96`](https://github.com/tivac/modular-css/commit/edbbe9667fa4333913bb95cd8c7e67f386f57054), [`ffab76d`](https://github.com/tivac/modular-css/commit/ffab76d4428211ba33e6f7a6d518618b5cfdef00)]:
  - @modular-css/processor@29.0.1

## 29.0.0

### Major Changes

- [`7488bb1`](https://github.com/tivac/modular-css/commit/7488bb12add1175e8c5a1be59ca97ea8207a9d98) Thanks [@tivac](https://github.com/tivac)! - All the various interfaces to `@modular-css/processor` need to be updated because of the breaking changes to composition rules in #926

### Patch Changes

- Updated dependencies [[`a61fa35`](https://github.com/tivac/modular-css/commit/a61fa35f81e0c5c181c425e596c27f017acd5096)]:
  - @modular-css/processor@29.0.0

## 28.4.1

### Patch Changes

- Updated dependencies [[`8983ec7`](https://github.com/tivac/modular-css/commit/8983ec74fe945f2859c4078e66ef15095a75f9be)]:
  - @modular-css/processor@28.1.5

## 28.4.0

### Minor Changes

- [#901](https://github.com/tivac/modular-css/pull/901) [`6070a76`](https://github.com/tivac/modular-css/commit/6070a7649a0a15cd47adafc087ddf900230171ca) Thanks [@plesiecki](https://github.com/plesiecki)! - Restore defaultExport support

  `defaultExport` got lost as an available option with the introduction of `@modular-css/css-to-js`, so @plesiecki was kind enough to bring it back.

## 28.3.0

### Minor Changes

- [#901](https://github.com/tivac/modular-css/pull/901) [`02bc885`](https://github.com/tivac/modular-css/commit/02bc88570045be3e6e23adff5411b6ad1883d104) Thanks [@plesiecki](https://github.com/plesiecki)! - New option to change type of variable declaration — `variableDeclaration` which defaults to `const`. Can be set to `var` if necessary, e.g. ES5 support.

## 28.2.4

### Patch Changes

- [#898](https://github.com/tivac/modular-css/pull/898) [`b1af909`](https://github.com/tivac/modular-css/commit/b1af909ceaa2dbc4b54c376b9ed5a14a824c6e89) Thanks [@plesiecki](https://github.com/plesiecki)! - Class ordering in `.css` files could lead to invalid identifiers being created, so always make sure every class defined in the `.css` file has a local JS identifier before building the string concatenation to represent composition.

## 28.2.3

### Patch Changes

- Updated dependencies [[`daa9c53`](https://github.com/tivac/modular-css/commit/daa9c535e19f434e651fcbbbaf7cf48fa7b481ae)]:
  - @modular-css/processor@28.1.4

## 28.2.2

### Patch Changes

- [#862](https://github.com/tivac/modular-css/pull/862) [`2a20cd5`](https://github.com/tivac/modular-css/commit/2a20cd528d3a1dd34d2f034400ce334aeffa09ec) Thanks [@tivac](https://github.com/tivac)! - Always use absolute paths internally

  Previously `@modular-css/css-to-js` would use the path as passed to it, which could cause issues with bundlers that passed relative paths (usually because of the use of aliases). Since the module already had to normalize paths to be absolute it will now use those absolute paths internally when looking up information from the `Processor` instance.

## 28.2.1

### Patch Changes

- [#860](https://github.com/tivac/modular-css/pull/860) [`c19671f`](https://github.com/tivac/modular-css/commit/c19671fb8c4798d98a79e6f1d09cfc26e8a12eb7) Thanks [@tivac](https://github.com/tivac)! - Handle `options.namedExport.warn` correctly

  Previously setting `namedExport.warn` to `false` would still return warnings in some cases. Now if disabled it truly doesn't warn you.

* [#860](https://github.com/tivac/modular-css/pull/860) [`c19671f`](https://github.com/tivac/modular-css/commit/c19671fb8c4798d98a79e6f1d09cfc26e8a12eb7) Thanks [@tivac](https://github.com/tivac)! - Prevent explosions on unknown `id`s

  `@modular-css/css-to-js` would throw an error if it was passed an `id` that didn't exist as a file in the `processor` instance. Now, that'll early out with reasonable-but-still-gross output and a warning.

- [#860](https://github.com/tivac/modular-css/pull/860) [`c19671f`](https://github.com/tivac/modular-css/commit/c19671fb8c4798d98a79e6f1d09cfc26e8a12eb7) Thanks [@tivac](https://github.com/tivac)! - Cleaner output if no named exports

  This package used to output an empty `export { }` block if there were no named exports from a `.css` file. That was silly, and has been rectified. While this does change the output in this case it isn't a breaking change, since there were never any named exports being written out in the first place.

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [28.2.0](https://github.com/tivac/modular-css/compare/v28.1.4...v28.2.0) (2022-06-20)

### Bug Fixes

- **css-to-js:** use const ([18e07f8](https://github.com/tivac/modular-css/commit/18e07f862b1f886e01a948e441f20416442c0e3f))

### Features

- **css-to-js:** abs vs rel imports ([162c0be](https://github.com/tivac/modular-css/commit/162c0be5b8537e1be6363522c298c7bdbbab79a8))

## [28.1.4](https://github.com/tivac/modular-css/compare/v28.1.3...v28.1.4) (2022-06-16)

### Bug Fixes

- only include direct deps in compositions ([#857](https://github.com/tivac/modular-css/issues/857)) ([58f65c4](https://github.com/tivac/modular-css/commit/58f65c4d45f447407ae4a6193aeb10b368398897))

## [28.1.3](https://github.com/tivac/modular-css/compare/v28.1.2...v28.1.3) (2022-06-15)

### Bug Fixes

- don't move composed classes early ([#856](https://github.com/tivac/modular-css/issues/856)) ([00e84c8](https://github.com/tivac/modular-css/commit/00e84c87b63e392a22b4ffe7d98cb38ecd9161a5))

## [28.1.2](https://github.com/tivac/modular-css/compare/v28.1.1...v28.1.2) (2022-05-25)

### Bug Fixes

- **rollup:** generated JS always uses clean names ([#847](https://github.com/tivac/modular-css/issues/847)) ([3bf231d](https://github.com/tivac/modular-css/commit/3bf231de19e4b2a332796e6282e586142f717075)), closes [#846](https://github.com/tivac/modular-css/issues/846)

## [28.1.1](https://github.com/tivac/modular-css/compare/v28.1.0...v28.1.1) (2022-04-08)

### Bug Fixes

- rename & deconflict together ([#820](https://github.com/tivac/modular-css/issues/820)) ([ea6a0e9](https://github.com/tivac/modular-css/commit/ea6a0e9c92cb720fd64f5b3b67042233b0bd85b7))

# [28.0.0](https://github.com/tivac/modular-css/compare/v27.2.0...v28.0.0) (2022-02-25)

**Note:** Version bump only for package @modular-css/css-to-js

# [27.1.0](https://github.com/tivac/modular-css/compare/v27.0.3...v27.1.0) (2022-02-03)

### Features

- **css-to-js:** extract css-to-js from rollup ([85aac89](https://github.com/tivac/modular-css/commit/85aac8966adf73f22ed599fa3884db97530c208d))
- **vite:** vite plugin ([46c80da](https://github.com/tivac/modular-css/commit/46c80dab3c552b5ddf2c43683984d6c9112ecd39))
