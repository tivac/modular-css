# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [24.0.0](https://github.com/tivac/modular-css/compare/v23.0.6...v24.0.0) (2019-05-08)


### Code Refactoring

* **processor:** add dupewarn option and no longer resolve path case ([#582](https://github.com/tivac/modular-css/issues/582)) ([01581f9](https://github.com/tivac/modular-css/commit/01581f9)), closes [#581](https://github.com/tivac/modular-css/issues/581)


### BREAKING CHANGES

* **processor:** 





## [23.0.6](https://github.com/tivac/modular-css/compare/v23.0.5...v23.0.6) (2019-04-30)


### Bug Fixes

* **svelte:** properly trigger components to re-render on change ([#580](https://github.com/tivac/modular-css/issues/580)) ([831ed50](https://github.com/tivac/modular-css/commit/831ed50))





## [23.0.5](https://github.com/tivac/modular-css/compare/v23.0.4...v23.0.5) (2019-04-09)


### Bug Fixes

* **rollup:** better error details ([#579](https://github.com/tivac/modular-css/issues/579)) ([15da7ff](https://github.com/tivac/modular-css/commit/15da7ff)), closes [#578](https://github.com/tivac/modular-css/issues/578)





## [23.0.4](https://github.com/tivac/modular-css/compare/v23.0.3...v23.0.4) (2019-04-03)

**Note:** Version bump only for package @modular-css/rollup





## [23.0.3](https://github.com/tivac/modular-css/compare/v23.0.2...v23.0.3) (2019-03-29)


### Bug Fixes

* don't mutate arrays while iterating ([0f63ea2](https://github.com/tivac/modular-css/commit/0f63ea2))





# [23.0.0](https://github.com/tivac/modular-css/compare/v22.3.0...v23.0.0) (2019-03-28)

**Note:** Version bump only for package @modular-css/rollup





# [22.3.0](https://github.com/tivac/modular-css/compare/v22.2.0...v22.3.0) (2019-03-20)


### Features

* support supressing empty CSS files in rollup plugin ([#569](https://github.com/tivac/modular-css/issues/569)) ([f9240a3](https://github.com/tivac/modular-css/commit/f9240a3))





# [22.2.0](https://github.com/tivac/modular-css/compare/v22.1.4...v22.2.0) (2019-03-07)

**Note:** Version bump only for package @modular-css/rollup





## [22.1.4](https://github.com/tivac/modular-css/compare/v22.1.3...v22.1.4) (2019-02-16)


### Bug Fixes

* add homepage & repo directory fields ([f9c1606](https://github.com/tivac/modular-css/commit/f9c1606))





## [22.1.2](https://github.com/tivac/modular-css/compare/v22.1.1...v22.1.2) (2019-02-09)

**Note:** Version bump only for package @modular-css/rollup





## [22.1.1](https://github.com/tivac/modular-css/compare/v22.1.0...v22.1.1) (2019-02-06)


### Bug Fixes

* force rollup output to use .css ([#563](https://github.com/tivac/modular-css/issues/563)) ([8f4348e](https://github.com/tivac/modular-css/commit/8f4348e))
* work around rollup-pluginutils globbing cwd ([4c0bdd8](https://github.com/tivac/modular-css/commit/4c0bdd8))





# [22.1.0](https://github.com/tivac/modular-css/compare/v22.0.2...v22.1.0) (2019-02-06)


### Bug Fixes

* invalidate files when they're changed ([cb34c08](https://github.com/tivac/modular-css/commit/cb34c08))
* remove newlines after composes ([#561](https://github.com/tivac/modular-css/issues/561)) ([23569dc](https://github.com/tivac/modular-css/commit/23569dc))


### Features

* processor.normalize() & corrected chunking logic ([#562](https://github.com/tivac/modular-css/issues/562)) ([e0c5eee](https://github.com/tivac/modular-css/commit/e0c5eee)), closes [#559](https://github.com/tivac/modular-css/issues/559) [#560](https://github.com/tivac/modular-css/issues/560)





## [22.0.2](https://github.com/tivac/modular-css/compare/v22.0.1...v22.0.2) (2019-01-28)


### Bug Fixes

* metadata output breaks when common.css is output ([#556](https://github.com/tivac/modular-css/issues/556)) ([bf50079](https://github.com/tivac/modular-css/commit/bf50079))





## [22.0.1](https://github.com/tivac/modular-css/compare/v22.0.0...v22.0.1) (2019-01-27)


### Bug Fixes

* ignore external modules ([#555](https://github.com/tivac/modular-css/issues/555)) ([5a6fcd9](https://github.com/tivac/modular-css/commit/5a6fcd9))





# [22.0.0](https://github.com/tivac/modular-css/compare/v21.2.1...v22.0.0) (2019-01-25)


### Bug Fixes

* proper asset attribution ([#554](https://github.com/tivac/modular-css/issues/554)) ([16fc758](https://github.com/tivac/modular-css/commit/16fc758))


### BREAKING CHANGES

* Bundles will now have a `assets` and `dynamicAssets` array on them, and the metadata file will now contain an `assets` and `dynamicAssets` keys on them as well.

Both `assets` and `dynamicAssets` will only contain assets **directly** required by the bundle, instead of the bundle and all its dependencies.





# [21.2.0](https://github.com/tivac/modular-css/compare/v21.1.2...v21.2.0) (2019-01-24)

**Note:** Version bump only for package @modular-css/rollup





## [21.1.2](https://github.com/tivac/modular-css/compare/v21.1.1...v21.1.2) (2019-01-23)

**Note:** Version bump only for package @modular-css/rollup





## [21.1.1](https://github.com/tivac/modular-css/compare/v21.1.0...v21.1.1) (2019-01-21)


### Bug Fixes

* move bundle asset tagging later ([#546](https://github.com/tivac/modular-css/issues/546)) ([2fef785](https://github.com/tivac/modular-css/commit/2fef785))





# [21.1.0](https://github.com/tivac/modular-css/compare/v21.0.1...v21.1.0) (2019-01-21)


### Features

* add rollup-rewriter package ([#545](https://github.com/tivac/modular-css/issues/545)) ([b483ed6](https://github.com/tivac/modular-css/commit/b483ed6))





## [21.0.1](https://github.com/tivac/modular-css/compare/v21.0.0...v21.0.1) (2019-01-18)


### Bug Fixes

* support chunks that don't depend on css ([#544](https://github.com/tivac/modular-css/issues/544)) ([10074e3](https://github.com/tivac/modular-css/commit/10074e3)), closes [#543](https://github.com/tivac/modular-css/issues/543)





# [21.0.0](https://github.com/tivac/modular-css/compare/v20.0.1...v21.0.0) (2019-01-18)


### Bug Fixes

* support circular dependencies ([#541](https://github.com/tivac/modular-css/issues/541)) ([b8dce99](https://github.com/tivac/modular-css/commit/b8dce99)), closes [#539](https://github.com/tivac/modular-css/issues/539)


### Features

* add metadata output option ([#542](https://github.com/tivac/modular-css/issues/542)) ([e42e997](https://github.com/tivac/modular-css/commit/e42e997))


### BREAKING CHANGES

* The previous release would stick all unreferenced CSS at the beginning of the first bundle. This was a mistake, and has been rectified.





## [20.0.1](https://github.com/tivac/modular-css/compare/v20.0.0...v20.0.1) (2019-01-16)


### Bug Fixes

* handle dynamic imports removed by tree-shaking ([#538](https://github.com/tivac/modular-css/issues/538)) ([c2a09e1](https://github.com/tivac/modular-css/commit/c2a09e1))





# [20.0.0](https://github.com/tivac/modular-css/compare/v19.2.0...v20.0.0) (2019-01-15)


### Bug Fixes

* clean up rollup chunk naming & source maps ([#537](https://github.com/tivac/modular-css/issues/537)) ([dfef6ba](https://github.com/tivac/modular-css/commit/dfef6ba)), closes [#536](https://github.com/tivac/modular-css/issues/536)
* package fixes ([e03d3b7](https://github.com/tivac/modular-css/commit/e03d3b7))


### BREAKING CHANGES

* Source maps are written directly to the filesystem now, instead of going through rollup's asset pipeline. This is due to some limitations inherent in how the asset pipeline works and may be changed back once those can be resolved.





# [19.1.0](https://github.com/tivac/modular-css/compare/v19.0.0...v19.1.0) (2019-01-10)


### Bug Fixes

* check for files via processor.has() ([b5a539b](https://github.com/tivac/modular-css/commit/b5a539b)), closes [#533](https://github.com/tivac/modular-css/issues/533)
* rollup outputs non .css files in the correct order ([2b8fec6](https://github.com/tivac/modular-css/commit/2b8fec6))





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

**Note:** Version bump only for package @modular-css/rollup





# [17.0.0](https://github.com/tivac/modular-css/compare/v16.2.0...v17.0.0) (2018-10-22)

**Note:** Version bump only for package @modular-css/rollup





# [16.2.0](https://github.com/tivac/modular-css/compare/v16.1.0...v16.2.0) (2018-10-12)


### Features

* Add verbose option to rollup & svelte ([#521](https://github.com/tivac/modular-css/issues/521)) ([0706e3d](https://github.com/tivac/modular-css/commit/0706e3d)), closes [#520](https://github.com/tivac/modular-css/issues/520)






<a name="16.1.0"></a>
# [16.1.0](https://github.com/tivac/modular-css/compare/v16.0.0...v16.1.0) (2018-09-21)


### Features

* dev mode for rollup ([#518](https://github.com/tivac/modular-css/issues/518)) ([979e26d](https://github.com/tivac/modular-css/commit/979e26d))





<a name="16.0.0"></a>
# [16.0.0](https://github.com/tivac/modular-css/compare/v15.0.1...v16.0.0) (2018-09-01)


### Chores

* move all packages under modular-css org ([50341f7](https://github.com/tivac/modular-css/commit/50341f7))


### BREAKING CHANGES

* All package names have changed!





<a name="15.0.0"></a>
# [15.0.0](https://github.com/tivac/modular-css/compare/v14.4.0...v15.0.0) (2018-08-28)


### Features

* Named json output ([#509](https://github.com/tivac/modular-css/issues/509)) ([e32a4b3](https://github.com/tivac/modular-css/commit/e32a4b3)), closes [#485](https://github.com/tivac/modular-css/issues/485)
* Use rollup@0.65.0's watchChange event ([#511](https://github.com/tivac/modular-css/issues/511)) ([510b662](https://github.com/tivac/modular-css/commit/510b662))


### BREAKING CHANGES

* The default file name when `json : true` has changed from whatever the CSS file was called to `exports.json`





<a name="14.4.0"></a>
# [14.4.0](https://github.com/tivac/modular-css/compare/v14.3.0...v14.4.0) (2018-08-10)


### Features

* bundle specific ref-counting ([#467](https://github.com/tivac/modular-css/issues/467)) ([3d38d46](https://github.com/tivac/modular-css/commit/3d38d46)), closes [#466](https://github.com/tivac/modular-css/issues/466)





<a name="14.3.0"></a>
# [14.3.0](https://github.com/tivac/modular-css/compare/v14.2.1...v14.3.0) (2018-08-09)


### Features

* verbose logging option ([#465](https://github.com/tivac/modular-css/issues/465)) ([5238ade](https://github.com/tivac/modular-css/commit/5238ade))





<a name="14.2.1"></a>
## [14.2.1](https://github.com/tivac/modular-css/compare/v14.2.0...v14.2.1) (2018-08-01)

**Note:** Version bump only for package modular-css-rollup





<a name="14.2.0"></a>
# [14.2.0](https://github.com/tivac/modular-css/compare/v14.1.0...v14.2.0) (2018-07-25)


### Bug Fixes

* External map references ([#457](https://github.com/tivac/modular-css/issues/457)) ([2d3257e](https://github.com/tivac/modular-css/commit/2d3257e)), closes [#455](https://github.com/tivac/modular-css/issues/455)





<a name="14.1.0"></a>
# [14.1.0](https://github.com/tivac/modular-css/compare/v14.0.1...v14.1.0) (2018-07-18)


### Features

* add rollup option to export styles ([#453](https://github.com/tivac/modular-css/issues/453)) ([f0d4e43](https://github.com/tivac/modular-css/commit/f0d4e43))





<a name="14.0.1"></a>
## [14.0.1](https://github.com/tivac/modular-css/compare/v14.0.0...v14.0.1) (2018-07-16)

**Note:** Version bump only for package modular-css-rollup





<a name="14.0.0"></a>
# [14.0.0](https://github.com/tivac/modular-css/compare/v13.0.0...v14.0.0) (2018-07-13)


### Bug Fixes

* tighten up rollup bundles ([#450](https://github.com/tivac/modular-css/issues/450)) ([e7170d1](https://github.com/tivac/modular-css/commit/e7170d1))


### BREAKING CHANGES

* Common chunks will only be created if necessary now.





<a name="13.0.0"></a>
# [13.0.0](https://github.com/tivac/modular-css/compare/v12.1.3...v13.0.0) (2018-07-13)


### Bug Fixes

* Rollup rebuilds in watch mode ([#449](https://github.com/tivac/modular-css/issues/449)) ([d2eefec](https://github.com/tivac/modular-css/commit/d2eefec))
* support no assetFileNames configuration ([#448](https://github.com/tivac/modular-css/issues/448)) ([9e495dc](https://github.com/tivac/modular-css/commit/9e495dc)), closes [#447](https://github.com/tivac/modular-css/issues/447)


### BREAKING CHANGES

* `Processor.remove()` no longer removes the specified files AND their dependencies.





<a name="12.1.3"></a>
## [12.1.3](https://github.com/tivac/modular-css/compare/v12.1.2...v12.1.3) (2018-07-05)


### Bug Fixes

* Actually fix erroneous deletes from rollup ([caee07d](https://github.com/tivac/modular-css/commit/caee07d))





<a name="12.1.2"></a>
## [12.1.2](https://github.com/tivac/modular-css/compare/v12.1.0...v12.1.2) (2018-07-05)


### Bug Fixes

* Improve rollup dependency removal ([#442](https://github.com/tivac/modular-css/issues/442)) ([fb6c61a](https://github.com/tivac/modular-css/commit/fb6c61a)), closes [#441](https://github.com/tivac/modular-css/issues/441)





<a name="12.1.1"></a>
## [12.1.1](https://github.com/tivac/modular-css/compare/v12.1.0...v12.1.1) (2018-07-05)


### Bug Fixes

* Improve rollup dependency removal ([#442](https://github.com/tivac/modular-css/issues/442)) ([fb6c61a](https://github.com/tivac/modular-css/commit/fb6c61a)), closes [#441](https://github.com/tivac/modular-css/issues/441)





<a name="12.1.0"></a>
# [12.1.0](https://github.com/tivac/modular-css/compare/v12.0.2...v12.1.0) (2018-06-26)


### Features

* rollup transform dependencies support ([#438](https://github.com/tivac/modular-css/issues/438)) ([7347d8f](https://github.com/tivac/modular-css/commit/7347d8f))





<a name="12.0.2"></a>
## [12.0.2](https://github.com/tivac/modular-css/compare/v12.0.1...v12.0.2) (2018-06-22)

**Note:** Version bump only for package modular-css-rollup





<a name="12.0.1"></a>
## [12.0.1](https://github.com/tivac/modular-css/compare/v12.0.0...v12.0.1) (2018-06-13)


### Bug Fixes

* .emitAsset() can't be called twice now ([24e6562](https://github.com/tivac/modular-css/commit/24e6562))





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


### Features

* support for rollup@0.60.0 api ([#429](https://github.com/tivac/modular-css/issues/429)) ([f731e9b](https://github.com/tivac/modular-css/commit/f731e9b))


### BREAKING CHANGES

* This will break compatibility with all versions of rollup < 0.60.0





<a name="10.1.0"></a>
# [10.1.0](https://github.com/tivac/modular-css/compare/v10.0.0...v10.1.0) (2018-06-03)

**Note:** Version bump only for package modular-css-rollup





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





<a name="8.1.0"></a>
# [8.1.0](https://github.com/tivac/modular-css/compare/v8.0.3...v8.1.0) (2018-02-21)




**Note:** Version bump only for package modular-css-rollup

<a name="8.0.2"></a>
## [8.0.2](https://github.com/tivac/modular-css/compare/v8.0.0...v8.0.2) (2018-02-16)


### Bug Fixes

* Correctly support named exports of  [@value](https://github.com/value) ([#399](https://github.com/tivac/modular-css/issues/399)) ([166bfb2](https://github.com/tivac/modular-css/commit/166bfb2))




<a name="8.0.0"></a>
# [8.0.0](https://github.com/tivac/modular-css/compare/v7.2.0...v8.0.0) (2018-02-09)


### Features

* External source maps ([#326](https://github.com/tivac/modular-css/issues/326)) ([8df5baa](https://github.com/tivac/modular-css/commit/8df5baa))




<a name="7.2.0"></a>
# [7.2.0](https://github.com/tivac/modular-css/compare/v7.1.0...v7.2.0) (2017-12-13)


### Bug Fixes

* rollup watching loses file contents ([#377](https://github.com/tivac/modular-css/issues/377)) ([347ee8d](https://github.com/tivac/modular-css/commit/347ee8d))




<a name="7.1.0"></a>
# [7.1.0](https://github.com/tivac/modular-css/compare/v7.0.0...v7.1.0) (2017-12-11)


### Bug Fixes

* onwrite not returning the promise ([9ab15de](https://github.com/tivac/modular-css/commit/9ab15de))


### Features

* Svelte preprocess support ([#374](https://github.com/tivac/modular-css/issues/374)) ([0216a0c](https://github.com/tivac/modular-css/commit/0216a0c))




<a name="7.0.0"></a>
# [7.0.0](https://github.com/tivac/modular-css/compare/v6.1.0...v7.0.0) (2017-11-16)




**Note:** Version bump only for package modular-css-rollup

# 5.2.0

- feat: Option to disable named exports (#304)

# 4.1.4

- fix: avoid dependencies going missing with rollup (#266)

# 4.0.0

- refactor: convert to separate packages using lerna (#253)
