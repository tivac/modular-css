# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [25.4.0](https://github.com/tivac/modular-css/compare/v25.3.1...v25.4.0) (2020-02-05)


### Features

* add `.root()` to avoid re-parsing inputs when possible ([#717](https://github.com/tivac/modular-css/issues/717)) ([fdb010b](https://github.com/tivac/modular-css/commit/fdb010b))





## [25.3.1](https://github.com/tivac/modular-css/compare/v25.3.0...v25.3.1) (2020-01-23)


### Bug Fixes

* **processor:** don't assume `plugin` key on messages ([#712](https://github.com/tivac/modular-css/issues/712)) ([3a5279c](https://github.com/tivac/modular-css/commit/3a5279c))





# [25.2.0](https://github.com/tivac/modular-css/compare/v25.1.0...v25.2.0) (2019-10-30)


### Features

* Custom file reader api ([#671](https://github.com/tivac/modular-css/issues/671)) ([f1865c9](https://github.com/tivac/modular-css/commit/f1865c9))
* **processor:** add processor.resolve() ([#681](https://github.com/tivac/modular-css/issues/681)) ([2c5a51d](https://github.com/tivac/modular-css/commit/2c5a51d)), closes [#679](https://github.com/tivac/modular-css/issues/679)





# [25.1.0](https://github.com/tivac/modular-css/compare/v25.0.0...v25.1.0) (2019-09-23)


### Features

* option to suppress value export ([#673](https://github.com/tivac/modular-css/issues/673)) ([97a5b1e](https://github.com/tivac/modular-css/commit/97a5b1e)), closes [#672](https://github.com/tivac/modular-css/issues/672)





# [25.0.0](https://github.com/tivac/modular-css/compare/v24.2.2...v25.0.0) (2019-09-16)


### Features

* support from global for composes ([#669](https://github.com/tivac/modular-css/issues/669)) ([0a7996e](https://github.com/tivac/modular-css/commit/0a7996e))
* **processor:** allow composes anywhere in a rule ([#646](https://github.com/tivac/modular-css/issues/646)) ([31b57a2](https://github.com/tivac/modular-css/commit/31b57a2)), closes [#645](https://github.com/tivac/modular-css/issues/645)


### BREAKING CHANGES

* **processor:** previously `modular-css` would require that `composes` be the first declaration in  a rule. This restriction has been removed due to better solutions for enforcing that behavior existing now (stylelint-order).





## [24.2.2](https://github.com/tivac/modular-css/compare/v24.2.0...v24.2.2) (2019-07-08)


### Bug Fixes

* generate parsers before publishing ([2c72008](https://github.com/tivac/modular-css/commit/2c72008))





# [24.2.0](https://github.com/tivac/modular-css/compare/v24.1.0...v24.2.0) (2019-07-06)


### Features

* composes at-rule ([#635](https://github.com/tivac/modular-css/issues/635)) ([27d696a](https://github.com/tivac/modular-css/commit/27d696a)), closes [#633](https://github.com/tivac/modular-css/issues/633)





# [24.1.0](https://github.com/tivac/modular-css/compare/v24.0.1...v24.1.0) (2019-06-17)

**Note:** Version bump only for package @modular-css/processor





## [24.0.1](https://github.com/tivac/modular-css/compare/v24.0.0...v24.0.1) (2019-05-29)

**Note:** Version bump only for package @modular-css/processor





# [24.0.0](https://github.com/tivac/modular-css/compare/v23.0.6...v24.0.0) (2019-05-08)


### Code Refactoring

* **processor:** add dupewarn option and no longer resolve path case ([#582](https://github.com/tivac/modular-css/issues/582)) ([01581f9](https://github.com/tivac/modular-css/commit/01581f9)), closes [#581](https://github.com/tivac/modular-css/issues/581)


### BREAKING CHANGES

* **processor:** It was causing massive slowdowns to synchronously resolve files using `true-case-path`, and making it async wasn't a guaranteed win either. So it's removed, which should solve #581 pretty neatly. Instead now there's a warning if two files are included that differ in case only. It can be disabled by setting `dupewarn : false` as part of the config object.





## [23.0.4](https://github.com/tivac/modular-css/compare/v23.0.3...v23.0.4) (2019-04-03)

**Note:** Version bump only for package @modular-css/processor





# [23.0.0](https://github.com/tivac/modular-css/compare/v22.3.0...v23.0.0) (2019-03-28)


### Bug Fixes

* walk invalidated dependencies ([#573](https://github.com/tivac/modular-css/issues/573)) ([0284b11](https://github.com/tivac/modular-css/commit/0284b11)), closes [#532](https://github.com/tivac/modular-css/issues/532)


### Features

* replacing missing css.fooga with stringified version ([#574](https://github.com/tivac/modular-css/issues/574)) ([2084b62](https://github.com/tivac/modular-css/commit/2084b62))


### BREAKING CHANGES

* Previously missing css.fooga references would be left as-is, now they're wrapped in quotes to prevent them from causing JS errors. If you want missing classes to break things you should enable strict mode. Also no longer injecting a `<script>` block just to import css if there isn't already a `<script>` block defined in the module.





## [22.1.4](https://github.com/tivac/modular-css/compare/v22.1.3...v22.1.4) (2019-02-16)


### Bug Fixes

* add homepage & repo directory fields ([f9c1606](https://github.com/tivac/modular-css/commit/f9c1606))





## [22.1.2](https://github.com/tivac/modular-css/compare/v22.1.1...v22.1.2) (2019-02-09)


### Bug Fixes

* dependency processing race condition ([#565](https://github.com/tivac/modular-css/issues/565)) ([436c1c8](https://github.com/tivac/modular-css/commit/436c1c8))





# [22.1.0](https://github.com/tivac/modular-css/compare/v22.0.2...v22.1.0) (2019-02-06)


### Bug Fixes

* log file invalidations ([0b1476e](https://github.com/tivac/modular-css/commit/0b1476e))
* remove newlines after composes ([#561](https://github.com/tivac/modular-css/issues/561)) ([23569dc](https://github.com/tivac/modular-css/commit/23569dc))


### Features

* processor.normalize() & corrected chunking logic ([#562](https://github.com/tivac/modular-css/issues/562)) ([e0c5eee](https://github.com/tivac/modular-css/commit/e0c5eee)), closes [#559](https://github.com/tivac/modular-css/issues/559) [#560](https://github.com/tivac/modular-css/issues/560)





## [22.0.1](https://github.com/tivac/modular-css/compare/v22.0.0...v22.0.1) (2019-01-27)


### Bug Fixes

* ignore external modules ([#555](https://github.com/tivac/modular-css/issues/555)) ([5a6fcd9](https://github.com/tivac/modular-css/commit/5a6fcd9))





# [22.0.0](https://github.com/tivac/modular-css/compare/v21.2.1...v22.0.0) (2019-01-25)

**Note:** Version bump only for package @modular-css/processor





# [21.2.0](https://github.com/tivac/modular-css/compare/v21.1.2...v21.2.0) (2019-01-24)


### Bug Fixes

* use a safer regex for finding [@values](https://github.com/values) ([#552](https://github.com/tivac/modular-css/issues/552)) ([c6a684c](https://github.com/tivac/modular-css/commit/c6a684c)), closes [#548](https://github.com/tivac/modular-css/issues/548)


### Features

* support postcss process options ([#551](https://github.com/tivac/modular-css/issues/551)) ([86d6d68](https://github.com/tivac/modular-css/commit/86d6d68)), closes [#550](https://github.com/tivac/modular-css/issues/550)





## [21.1.1](https://github.com/tivac/modular-css/compare/v21.1.0...v21.1.1) (2019-01-21)

**Note:** Version bump only for package @modular-css/processor





# [21.0.0](https://github.com/tivac/modular-css/compare/v20.0.1...v21.0.0) (2019-01-18)

**Note:** Version bump only for package @modular-css/processor





# [20.0.0](https://github.com/tivac/modular-css/compare/v19.2.0...v20.0.0) (2019-01-15)


### Bug Fixes

* package fixes ([e03d3b7](https://github.com/tivac/modular-css/commit/e03d3b7))





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
