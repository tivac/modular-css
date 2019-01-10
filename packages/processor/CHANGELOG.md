# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [19.1.0](https://github.com/tivac/modular-css/compare/v19.0.0...v19.1.0) (2019-01-10)


### Bug Fixes

* better error if resolver returns bad file ([513c2a9](https://github.com/tivac/modular-css/commit/513c2a9))
* remove random async from processor.string ([d5ca5c0](https://github.com/tivac/modular-css/commit/d5ca5c0))


### Features

* add processor.has to check for known files ([df5ac6f](https://github.com/tivac/modular-css/commit/df5ac6f))





# [19.0.0](https://github.com/tivac/modular-css/compare/v18.0.0...v19.0.0) (2019-01-01)


### Features

* Rollup@1.0 support ([#532](https://github.com/tivac/modular-css/issues/532)) ([1fab777](https://github.com/tivac/modular-css/commit/1fab777))


### BREAKING CHANGES

* requires rollup@1.0





# [18.0.0](https://github.com/tivac/modular-css/compare/v17.1.2...v18.0.0) (2018-12-22)


### Features

* Rework rollup support ([#531](https://github.com/tivac/modular-css/issues/531)) ([fce87fe](https://github.com/tivac/modular-css/commit/fce87fe))


### BREAKING CHANGES

* changed rollup plugin CSS output so it better matches rollup output chunk format & bumped minimum rollup version to 0.68.0





## [17.1.2](https://github.com/tivac/modular-css/compare/v17.1.1...v17.1.2) (2018-11-26)


### Bug Fixes

* path casing ([#528](https://github.com/tivac/modular-css/issues/528)) ([2d4af90](https://github.com/tivac/modular-css/commit/2d4af90))





## [17.1.1](https://github.com/tivac/modular-css/compare/v17.1.0...v17.1.1) (2018-11-08)

**Note:** Version bump only for package @modular-css/processor





# [17.0.0](https://github.com/tivac/modular-css/compare/v16.2.0...v17.0.0) (2018-10-22)

**Note:** Version bump only for package @modular-css/processor





# [16.2.0](https://github.com/tivac/modular-css/compare/v16.1.0...v16.2.0) (2018-10-12)


### Features

* Add verbose option to rollup & svelte ([#521](https://github.com/tivac/modular-css/issues/521)) ([0706e3d](https://github.com/tivac/modular-css/commit/0706e3d)), closes [#520](https://github.com/tivac/modular-css/issues/520)






<a name="16.1.0"></a>
# [16.1.0](https://github.com/tivac/modular-css/compare/v16.0.0...v16.1.0) (2018-09-21)

**Note:** Version bump only for package @modular-css/processor





<a name="16.0.0"></a>
# [16.0.0](https://github.com/tivac/modular-css/compare/v15.0.1...v16.0.0) (2018-09-01)

**Note:** Version bump only for package @modular-css/processor





<a name="15.0.0"></a>
# [15.0.0](https://github.com/tivac/modular-css/compare/v14.4.0...v15.0.0) (2018-08-28)


### Bug Fixes

* **deps:** update dependency postcss-url to v8 ([#497](https://github.com/tivac/modular-css/issues/497)) ([b270db5](https://github.com/tivac/modular-css/commit/b270db5))
* run after plugins against files serially ([#508](https://github.com/tivac/modular-css/issues/508)) ([14bae1d](https://github.com/tivac/modular-css/commit/14bae1d))


### BREAKING CHANGES

* `Processor` instances must be instantiated with `new`, they're no longer auto-instantiating





<a name="14.4.0"></a>
# [14.4.0](https://github.com/tivac/modular-css/compare/v14.3.0...v14.4.0) (2018-08-10)

**Note:** Version bump only for package modular-css-core





<a name="14.3.0"></a>
# [14.3.0](https://github.com/tivac/modular-css/compare/v14.2.1...v14.3.0) (2018-08-09)


### Features

* verbose logging option ([#465](https://github.com/tivac/modular-css/issues/465)) ([5238ade](https://github.com/tivac/modular-css/commit/5238ade))





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

* remove lodash.uniq usage ([d995217](https://github.com/tivac/modular-css/commit/d995217)), closes [#452](https://github.com/tivac/modular-css/issues/452)





<a name="14.0.0"></a>
# [14.0.0](https://github.com/tivac/modular-css/compare/v13.0.0...v14.0.0) (2018-07-13)

**Note:** Version bump only for package modular-css-core





<a name="13.0.0"></a>
# [13.0.0](https://github.com/tivac/modular-css/compare/v12.1.3...v13.0.0) (2018-07-13)


### Bug Fixes

* Rollup rebuilds in watch mode ([#449](https://github.com/tivac/modular-css/issues/449)) ([d2eefec](https://github.com/tivac/modular-css/commit/d2eefec))


### BREAKING CHANGES

* `Processor.remove()` no longer removes the specified files AND their dependencies.





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

* adding new files w/ rollup shouldn't error ([#422](https://github.com/tivac/modular-css/issues/422)) ([67e1707](https://github.com/tivac/modular-css/commit/67e1707)), closes [#421](https://github.com/tivac/modular-css/issues/421)


### BREAKING CHANGES

* Processor.remove now always returns an array. If
nothing was removed the array will be empty.





<a name="9.0.0"></a>
# [9.0.0](https://github.com/tivac/modular-css/compare/v8.2.0...v9.0.0) (2018-04-25)

**Note:** Version bump only for package modular-css-core





<a name="8.1.0"></a>
# [8.1.0](https://github.com/tivac/modular-css/compare/v8.0.3...v8.1.0) (2018-02-21)


### Features

* Allow plugin exports via "processing" lifecycle hook ([#404](https://github.com/tivac/modular-css/issues/404)) ([72a89de](https://github.com/tivac/modular-css/commit/72a89de)), closes [#401](https://github.com/tivac/modular-css/issues/401)




<a name="8.0.0"></a>
# [8.0.0](https://github.com/tivac/modular-css/compare/v7.2.0...v8.0.0) (2018-02-09)


### Features

* Exporting values. ([#396](https://github.com/tivac/modular-css/issues/396)) ([#398](https://github.com/tivac/modular-css/issues/398)) ([4a15d8f](https://github.com/tivac/modular-css/commit/4a15d8f))
* External source maps ([#326](https://github.com/tivac/modular-css/issues/326)) ([8df5baa](https://github.com/tivac/modular-css/commit/8df5baa))


### BREAKING CHANGES

* Values will now be exported alongside composed classes




<a name="7.2.0"></a>
# [7.2.0](https://github.com/tivac/modular-css/compare/v7.1.0...v7.2.0) (2017-12-13)


### Features

* **modular-css-core:** processor.remove returns removed files ([#376](https://github.com/tivac/modular-css/issues/376)) ([b560651](https://github.com/tivac/modular-css/commit/b560651))




<a name="7.0.0"></a>
# [7.0.0](https://github.com/tivac/modular-css/compare/v6.1.0...v7.0.0) (2017-11-16)


### Bug Fixes

* Overlapping value replacement ([#365](https://github.com/tivac/modular-css/issues/365)) ([1f6fdb5](https://github.com/tivac/modular-css/commit/1f6fdb5)), closes [#363](https://github.com/tivac/modular-css/issues/363)


### Features

* add rewrite option ([#368](https://github.com/tivac/modular-css/issues/368)) ([9bae543](https://github.com/tivac/modular-css/commit/9bae543))


### BREAKING CHANGES

* To prevent `postcss-url` from running you now specify `rewrite: false` instead of defining an `after` segment.
