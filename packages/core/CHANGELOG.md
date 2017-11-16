# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="7.0.0"></a>
# [7.0.0](https://github.com/tivac/modular-css/compare/v6.1.0...v7.0.0) (2017-11-16)


### Bug Fixes

* Overlapping value replacement ([#365](https://github.com/tivac/modular-css/issues/365)) ([1f6fdb5](https://github.com/tivac/modular-css/commit/1f6fdb5)), closes [#363](https://github.com/tivac/modular-css/issues/363)


### Features

* add rewrite option ([#368](https://github.com/tivac/modular-css/issues/368)) ([9bae543](https://github.com/tivac/modular-css/commit/9bae543))


### BREAKING CHANGES

* To prevent `postcss-url` from running you now specify `rewrite: false` instead of defining an `after` segment.
