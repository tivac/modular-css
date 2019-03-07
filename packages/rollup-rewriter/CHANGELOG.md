# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [22.2.0](https://github.com/tivac/modular-css/compare/v22.1.4...v22.2.0) (2019-03-07)

**Note:** Version bump only for package @modular-css/rollup-rewriter





## [22.1.4](https://github.com/tivac/modular-css/compare/v22.1.3...v22.1.4) (2019-02-16)


### Bug Fixes

* add homepage & repo directory fields ([f9c1606](https://github.com/tivac/modular-css/commit/f9c1606))





## [22.1.3](https://github.com/tivac/modular-css/compare/v22.1.2...v22.1.3) (2019-02-10)


### Bug Fixes

* clean up netlify deploys ([#566](https://github.com/tivac/modular-css/issues/566)) ([39c11d5](https://github.com/tivac/modular-css/commit/39c11d5))





# [22.1.0](https://github.com/tivac/modular-css/compare/v22.0.2...v22.1.0) (2019-02-06)


### Features

* processor.normalize() & corrected chunking logic ([#562](https://github.com/tivac/modular-css/issues/562)) ([e0c5eee](https://github.com/tivac/modular-css/commit/e0c5eee)), closes [#559](https://github.com/tivac/modular-css/issues/559) [#560](https://github.com/tivac/modular-css/issues/560)





# [22.0.0](https://github.com/tivac/modular-css/compare/v21.2.1...v22.0.0) (2019-01-25)


### Bug Fixes

* proper asset attribution ([#554](https://github.com/tivac/modular-css/issues/554)) ([16fc758](https://github.com/tivac/modular-css/commit/16fc758))


### BREAKING CHANGES

* Bundles will now have a `assets` and `dynamicAssets` array on them, and the metadata file will now contain an `assets` and `dynamicAssets` keys on them as well.

Both `assets` and `dynamicAssets` will only contain assets **directly** required by the bundle, instead of the bundle and all its dependencies.





## [21.1.2](https://github.com/tivac/modular-css/compare/v21.1.1...v21.1.2) (2019-01-23)


### Bug Fixes

* properly support loader option ([#549](https://github.com/tivac/modular-css/issues/549)) ([ff38e83](https://github.com/tivac/modular-css/commit/ff38e83))





## [21.1.1](https://github.com/tivac/modular-css/compare/v21.1.0...v21.1.1) (2019-01-21)


### Bug Fixes

* limit import() rewrites ([#547](https://github.com/tivac/modular-css/issues/547)) ([32e58e6](https://github.com/tivac/modular-css/commit/32e58e6))





# [21.1.0](https://github.com/tivac/modular-css/compare/v21.0.1...v21.1.0) (2019-01-21)


### Features

* add rollup-rewriter package ([#545](https://github.com/tivac/modular-css/issues/545)) ([b483ed6](https://github.com/tivac/modular-css/commit/b483ed6))
