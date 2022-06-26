# Change Log

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
