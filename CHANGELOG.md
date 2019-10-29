# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [25.1.0](https://github.com/tivac/modular-css/compare/v25.0.0...v25.1.0) (2019-09-23)


### Features

* option to suppress value export ([#673](https://github.com/tivac/modular-css/issues/673)) ([97a5b1e](https://github.com/tivac/modular-css/commit/97a5b1e)), closes [#672](https://github.com/tivac/modular-css/issues/672)





# [25.0.0](https://github.com/tivac/modular-css/compare/v24.2.2...v25.0.0) (2019-09-16)


### Bug Fixes

* use this.emitFile() API from rollup ([#666](https://github.com/tivac/modular-css/issues/666)) ([108a4a1](https://github.com/tivac/modular-css/commit/108a4a1))
* **www:** stub out module since resolve-from uses it now ([e11947c](https://github.com/tivac/modular-css/commit/e11947c))
* **www:** trying this again... ([b3d9221](https://github.com/tivac/modular-css/commit/b3d9221))


### Features

* support from global for composes ([#669](https://github.com/tivac/modular-css/issues/669)) ([0a7996e](https://github.com/tivac/modular-css/commit/0a7996e))
* **processor:** allow composes anywhere in a rule ([#646](https://github.com/tivac/modular-css/issues/646)) ([31b57a2](https://github.com/tivac/modular-css/commit/31b57a2)), closes [#645](https://github.com/tivac/modular-css/issues/645)
* **rollup-rewriter:** let loader option be a function ([#667](https://github.com/tivac/modular-css/issues/667)) ([a57cddf](https://github.com/tivac/modular-css/commit/a57cddf))
* **stylelint-config:** add @modular-css/stylelint-config package ([#637](https://github.com/tivac/modular-css/issues/637)) ([bc3b711](https://github.com/tivac/modular-css/commit/bc3b711))


### BREAKING CHANGES

* **processor:** previously `modular-css` would require that `composes` be the first declaration in  a rule. This restriction has been removed due to better solutions for enforcing that behavior existing now (stylelint-order).





## [24.2.2](https://github.com/tivac/modular-css/compare/v24.2.0...v24.2.2) (2019-07-08)


### Bug Fixes

* generate parsers before publishing ([2c72008](https://github.com/tivac/modular-css/commit/2c72008))





# [24.2.0](https://github.com/tivac/modular-css/compare/v24.1.0...v24.2.0) (2019-07-06)


### Features

* composes at-rule ([#635](https://github.com/tivac/modular-css/issues/635)) ([27d696a](https://github.com/tivac/modular-css/commit/27d696a)), closes [#633](https://github.com/tivac/modular-css/issues/633)





# [24.1.0](https://github.com/tivac/modular-css/compare/v24.0.1...v24.1.0) (2019-06-17)


### Features

* **webpack:** add styleExport option ([#613](https://github.com/tivac/modular-css/issues/613)) ([8fc3ae1](https://github.com/tivac/modular-css/commit/8fc3ae1))





## [24.0.1](https://github.com/tivac/modular-css/compare/v24.0.0...v24.0.1) (2019-05-29)


### Bug Fixes

* **rollup:** properly include dependencies ([#602](https://github.com/tivac/modular-css/issues/602)) ([c581e3d](https://github.com/tivac/modular-css/commit/c581e3d))





# [24.0.0](https://github.com/tivac/modular-css/compare/v23.0.6...v24.0.0) (2019-05-08)


### Code Refactoring

* **processor:** add dupewarn option and no longer resolve path case ([#582](https://github.com/tivac/modular-css/issues/582)) ([01581f9](https://github.com/tivac/modular-css/commit/01581f9)), closes [#581](https://github.com/tivac/modular-css/issues/581)


### BREAKING CHANGES

* **processor:** It was causing massive slowdowns to synchronously resolve files using `true-case-path`, and making it async wasn't a guaranteed win either. So it's removed, which should solve #581 pretty neatly. Instead now there's a warning if two files are included that differ in case only. It can be disabled by setting `dupewarn : false` as part of the config object.




## [23.0.6](https://github.com/tivac/modular-css/compare/v23.0.5...v23.0.6) (2019-04-30)


### Bug Fixes

* **svelte:** properly trigger components to re-render on change ([#580](https://github.com/tivac/modular-css/issues/580)) ([831ed50](https://github.com/tivac/modular-css/commit/831ed50))





## [23.0.5](https://github.com/tivac/modular-css/compare/v23.0.4...v23.0.5) (2019-04-09)


### Bug Fixes

* **rollup:** better error details ([#579](https://github.com/tivac/modular-css/issues/579)) ([15da7ff](https://github.com/tivac/modular-css/commit/15da7ff)), closes [#578](https://github.com/tivac/modular-css/issues/578)





## [23.0.4](https://github.com/tivac/modular-css/compare/v23.0.3...v23.0.4) (2019-04-03)


### Bug Fixes

* **rollup-rewriter:** include static dependencies ([#577](https://github.com/tivac/modular-css/issues/577)) ([ca499c6](https://github.com/tivac/modular-css/commit/ca499c6))





## [23.0.3](https://github.com/tivac/modular-css/compare/v23.0.2...v23.0.3) (2019-03-29)


### Bug Fixes

* don't mutate arrays while iterating ([0f63ea2](https://github.com/tivac/modular-css/commit/0f63ea2))





## [23.0.2](https://github.com/tivac/modular-css/compare/v23.0.1...v23.0.2) (2019-03-29)

**Note:** Version bump only for package modular-css





## [23.0.1](https://github.com/tivac/modular-css/compare/v23.0.0...v23.0.1) (2019-03-29)


### Bug Fixes

* replace multiple missing values ([#576](https://github.com/tivac/modular-css/issues/576)) ([d48ac67](https://github.com/tivac/modular-css/commit/d48ac67)), closes [#575](https://github.com/tivac/modular-css/issues/575) [#575](https://github.com/tivac/modular-css/issues/575)





# [23.0.0](https://github.com/tivac/modular-css/compare/v22.3.0...v23.0.0) (2019-03-28)


### Bug Fixes

* walk invalidated dependencies ([#573](https://github.com/tivac/modular-css/issues/573)) ([0284b11](https://github.com/tivac/modular-css/commit/0284b11)), closes [#532](https://github.com/tivac/modular-css/issues/532)


### Features

* replacing missing css.fooga with stringified version ([#574](https://github.com/tivac/modular-css/issues/574)) ([2084b62](https://github.com/tivac/modular-css/commit/2084b62))


### BREAKING CHANGES

* Previously missing css.fooga references would be left as-is, now they're wrapped in quotes to prevent them from causing JS errors. If you want missing classes to break things you should enable strict mode. Also no longer injecting a `<script>` block just to import css if there isn't already a `<script>` block defined in the module.





# [22.3.0](https://github.com/tivac/modular-css/compare/v22.2.0...v22.3.0) (2019-03-20)


### Features

* support supressing empty CSS files in rollup plugin ([#569](https://github.com/tivac/modular-css/issues/569)) ([f9240a3](https://github.com/tivac/modular-css/commit/f9240a3))





# [22.2.0](https://github.com/tivac/modular-css/compare/v22.1.4...v22.2.0) (2019-03-07)


### Features

* Include Style String in Webpack Loader Output ([#567](https://github.com/tivac/modular-css/issues/567)) ([6d883ac](https://github.com/tivac/modular-css/commit/6d883ac))





## [22.1.4](https://github.com/tivac/modular-css/compare/v22.1.3...v22.1.4) (2019-02-16)


### Bug Fixes

* add homepage & repo directory fields ([f9c1606](https://github.com/tivac/modular-css/commit/f9c1606))





## [22.1.3](https://github.com/tivac/modular-css/compare/v22.1.2...v22.1.3) (2019-02-10)


### Bug Fixes

* add repo link to header ([b47c1ad](https://github.com/tivac/modular-css/commit/b47c1ad)), closes [#564](https://github.com/tivac/modular-css/issues/564)
* add some spacing after content ([d84579a](https://github.com/tivac/modular-css/commit/d84579a))
* clean up netlify deploys ([#566](https://github.com/tivac/modular-css/issues/566)) ([39c11d5](https://github.com/tivac/modular-css/commit/39c11d5))
* flatten out all static calc()s ([4518d75](https://github.com/tivac/modular-css/commit/4518d75))
* try to get netlify to use node@10 ([955c4f6](https://github.com/tivac/modular-css/commit/955c4f6))





## [22.1.2](https://github.com/tivac/modular-css/compare/v22.1.1...v22.1.2) (2019-02-09)


### Bug Fixes

* dependency processing race condition ([#565](https://github.com/tivac/modular-css/issues/565)) ([436c1c8](https://github.com/tivac/modular-css/commit/436c1c8))





## [22.1.1](https://github.com/tivac/modular-css/compare/v22.1.0...v22.1.1) (2019-02-06)


### Bug Fixes

* force rollup output to use .css ([#563](https://github.com/tivac/modular-css/issues/563)) ([8f4348e](https://github.com/tivac/modular-css/commit/8f4348e))
* work around rollup-pluginutils globbing cwd ([4c0bdd8](https://github.com/tivac/modular-css/commit/4c0bdd8))





# [22.1.0](https://github.com/tivac/modular-css/compare/v22.0.2...v22.1.0) (2019-02-06)


### Bug Fixes

* invalidate files when they're changed ([cb34c08](https://github.com/tivac/modular-css/commit/cb34c08))
* log file invalidations ([0b1476e](https://github.com/tivac/modular-css/commit/0b1476e))
* remove newlines after composes ([#561](https://github.com/tivac/modular-css/issues/561)) ([23569dc](https://github.com/tivac/modular-css/commit/23569dc))


### Features

* new website ([#557](https://github.com/tivac/modular-css/issues/557)) ([059fd7a](https://github.com/tivac/modular-css/commit/059fd7a))
* processor.normalize() & corrected chunking logic ([#562](https://github.com/tivac/modular-css/issues/562)) ([e0c5eee](https://github.com/tivac/modular-css/commit/e0c5eee)), closes [#559](https://github.com/tivac/modular-css/issues/559) [#560](https://github.com/tivac/modular-css/issues/560)
* svelte processor arg & improved test coverage ([#558](https://github.com/tivac/modular-css/issues/558)) ([7655d72](https://github.com/tivac/modular-css/commit/7655d72))





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





## [21.2.1](https://github.com/tivac/modular-css/compare/v21.2.0...v21.2.1) (2019-01-24)


### Bug Fixes

* ignore URLs in <link href>  ([#553](https://github.com/tivac/modular-css/issues/553)) ([16ec1d9](https://github.com/tivac/modular-css/commit/16ec1d9))





# [21.2.0](https://github.com/tivac/modular-css/compare/v21.1.2...v21.2.0) (2019-01-24)


### Bug Fixes

* use a safer regex for finding [@values](https://github.com/values) ([#552](https://github.com/tivac/modular-css/issues/552)) ([c6a684c](https://github.com/tivac/modular-css/commit/c6a684c)), closes [#548](https://github.com/tivac/modular-css/issues/548)


### Features

* support postcss process options ([#551](https://github.com/tivac/modular-css/issues/551)) ([86d6d68](https://github.com/tivac/modular-css/commit/86d6d68)), closes [#550](https://github.com/tivac/modular-css/issues/550)





## [21.1.2](https://github.com/tivac/modular-css/compare/v21.1.1...v21.1.2) (2019-01-23)


### Bug Fixes

* properly support loader option ([#549](https://github.com/tivac/modular-css/issues/549)) ([ff38e83](https://github.com/tivac/modular-css/commit/ff38e83))





## [21.1.1](https://github.com/tivac/modular-css/compare/v21.1.0...v21.1.1) (2019-01-21)


### Bug Fixes

* limit import() rewrites ([#547](https://github.com/tivac/modular-css/issues/547)) ([32e58e6](https://github.com/tivac/modular-css/commit/32e58e6))
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





# [19.2.0](https://github.com/tivac/modular-css/compare/v19.1.0...v19.2.0) (2019-01-11)


### Features

* Update Webpack plugin to accept existing processor ([#535](https://github.com/tivac/modular-css/issues/535)) ([15f1e15](https://github.com/tivac/modular-css/commit/15f1e15))





# [19.1.0](https://github.com/tivac/modular-css/compare/v19.0.0...v19.1.0) (2019-01-10)


### Bug Fixes

* better error if resolver returns bad file ([513c2a9](https://github.com/tivac/modular-css/commit/513c2a9))
* check for files via processor.has() ([b5a539b](https://github.com/tivac/modular-css/commit/b5a539b)), closes [#533](https://github.com/tivac/modular-css/issues/533)
* remove random async from processor.string ([d5ca5c0](https://github.com/tivac/modular-css/commit/d5ca5c0))
* rollup outputs non .css files in the correct order ([2b8fec6](https://github.com/tivac/modular-css/commit/2b8fec6))


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


### Bug Fixes

* tweak value support in svelte preprocessor ([7cc0f22](https://github.com/tivac/modular-css/commit/7cc0f22))





# [17.1.0](https://github.com/tivac/modular-css/compare/v17.0.0...v17.1.0) (2018-10-24)


### Features

* Rework svelte for race-condition fix ([#524](https://github.com/tivac/modular-css/issues/524)) ([9d465db](https://github.com/tivac/modular-css/commit/9d465db))





# [17.0.0](https://github.com/tivac/modular-css/compare/v16.2.0...v17.0.0) (2018-10-22)


### Features

* rework svelte as class, disable default removal ([a6e3ee6](https://github.com/tivac/modular-css/commit/a6e3ee6)), closes [#522](https://github.com/tivac/modular-css/issues/522)


### BREAKING CHANGES

* if you want to remove files as they're re-processed (for standalone usage, for instance), you'll now need to pass `{ clean : true }`.





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





<a name="15.0.1"></a>
## [15.0.1](https://github.com/tivac/modular-css/compare/v15.0.0...v15.0.1) (2018-08-29)


### Bug Fixes

* modular-css-svelte handles empty CSS files ([#513](https://github.com/tivac/modular-css/issues/513)) ([78ba84b](https://github.com/tivac/modular-css/commit/78ba84b)), closes [#512](https://github.com/tivac/modular-css/issues/512)





<a name="15.0.0"></a>
# [15.0.0](https://github.com/tivac/modular-css/compare/v14.4.0...v15.0.0) (2018-08-28)


### Bug Fixes

* **deps:** update dependency meow to v5 ([#495](https://github.com/tivac/modular-css/issues/495)) ([e92795f](https://github.com/tivac/modular-css/commit/e92795f))
* **deps:** update dependency postcss-url to v8 ([#497](https://github.com/tivac/modular-css/issues/497)) ([b270db5](https://github.com/tivac/modular-css/commit/b270db5))
* run after plugins against files serially ([#508](https://github.com/tivac/modular-css/issues/508)) ([14bae1d](https://github.com/tivac/modular-css/commit/14bae1d))


### Features

* Named json output ([#509](https://github.com/tivac/modular-css/issues/509)) ([e32a4b3](https://github.com/tivac/modular-css/commit/e32a4b3)), closes [#485](https://github.com/tivac/modular-css/issues/485)
* Use rollup@0.65.0's watchChange event ([#511](https://github.com/tivac/modular-css/issues/511)) ([510b662](https://github.com/tivac/modular-css/commit/510b662))


### BREAKING CHANGES

* `Processor` instances must be instantiated with `new`, they're no longer auto-instantiating
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


### Bug Fixes

* remove files when re-preprocessing for svelte ([#463](https://github.com/tivac/modular-css/issues/463)) ([113cfa1](https://github.com/tivac/modular-css/commit/113cfa1)), closes [#462](https://github.com/tivac/modular-css/issues/462)





<a name="14.2.0"></a>
# [14.2.0](https://github.com/tivac/modular-css/compare/v14.1.0...v14.2.0) (2018-07-25)


### Bug Fixes

* External map references ([#457](https://github.com/tivac/modular-css/issues/457)) ([2d3257e](https://github.com/tivac/modular-css/commit/2d3257e)), closes [#455](https://github.com/tivac/modular-css/issues/455)


### Features

* add option to use output filepath for json ([#460](https://github.com/tivac/modular-css/issues/460)) ([037f933](https://github.com/tivac/modular-css/commit/037f933)), closes [#459](https://github.com/tivac/modular-css/issues/459)





<a name="14.1.0"></a>
# [14.1.0](https://github.com/tivac/modular-css/compare/v14.0.1...v14.1.0) (2018-07-18)


### Features

* add rollup option to export styles ([#453](https://github.com/tivac/modular-css/issues/453)) ([f0d4e43](https://github.com/tivac/modular-css/commit/f0d4e43))





<a name="14.0.1"></a>
## [14.0.1](https://github.com/tivac/modular-css/compare/v14.0.0...v14.0.1) (2018-07-16)


### Bug Fixes

* remove lodash.uniq usage ([d995217](https://github.com/tivac/modular-css/commit/d995217)), closes [#452](https://github.com/tivac/modular-css/issues/452)





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


### Features

* emit warnings on missing keys ([#445](https://github.com/tivac/modular-css/issues/445)) ([9cc656b](https://github.com/tivac/modular-css/commit/9cc656b))


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


### Bug Fixes

* Correct replacements of css.<key> values ([#436](https://github.com/tivac/modular-css/issues/436)) ([b4de308](https://github.com/tivac/modular-css/commit/b4de308))





<a name="12.0.1"></a>
## [12.0.1](https://github.com/tivac/modular-css/compare/v12.0.0...v12.0.1) (2018-06-13)


### Bug Fixes

* .emitAsset() can't be called twice now ([24e6562](https://github.com/tivac/modular-css/commit/24e6562))





<a name="12.0.0"></a>
# [12.0.0](https://github.com/tivac/modular-css/compare/v11.0.0...v12.0.0) (2018-06-08)


### Features

* rework svelte & rollup ([#430](https://github.com/tivac/modular-css/issues/430)) ([c80dafe](https://github.com/tivac/modular-css/commit/c80dafe))


### BREAKING CHANGES

- `modular-css-svelte` no longer has a custom rollup integration, use `modular-css-rollup` instead
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


### Features

* support <link> elements in svelte ([#426](https://github.com/tivac/modular-css/issues/426)) ([49f8f0a](https://github.com/tivac/modular-css/commit/49f8f0a))





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





<a name="8.2.0"></a>
# [8.2.0](https://github.com/tivac/modular-css/compare/v8.1.1...v8.2.0) (2018-03-08)


### Bug Fixes

* webpack tests ([#414](https://github.com/tivac/modular-css/issues/414)) ([d240805](https://github.com/tivac/modular-css/commit/d240805)), closes [#413](https://github.com/tivac/modular-css/issues/413)


### Features

* webpack 4 support ([#413](https://github.com/tivac/modular-css/issues/413)) ([7b2f285](https://github.com/tivac/modular-css/commit/7b2f285))




<a name="8.1.1"></a>
## [8.1.1](https://github.com/tivac/modular-css/compare/v8.1.0...v8.1.1) (2018-02-21)




**Note:** Version bump only for package modular-css-root

<a name="8.1.0"></a>
# [8.1.0](https://github.com/tivac/modular-css/compare/v8.0.3...v8.1.0) (2018-02-21)


### Features

* Allow plugin exports via "processing" lifecycle hook ([#404](https://github.com/tivac/modular-css/issues/404)) ([72a89de](https://github.com/tivac/modular-css/commit/72a89de)), closes [#401](https://github.com/tivac/modular-css/issues/401)




<a name="8.0.3"></a>
## [8.0.3](https://github.com/tivac/modular-css/compare/v8.0.2...v8.0.3) (2018-02-21)


### Bug Fixes

* webpack inline maps should work ([#406](https://github.com/tivac/modular-css/issues/406)) ([f396866](https://github.com/tivac/modular-css/commit/f396866))




<a name="8.0.2"></a>
## [8.0.2](https://github.com/tivac/modular-css/compare/v8.0.0...v8.0.2) (2018-02-16)


### Bug Fixes

* Correctly support named exports of  [@value](https://github.com/value) ([#399](https://github.com/tivac/modular-css/issues/399)) ([166bfb2](https://github.com/tivac/modular-css/commit/166bfb2))




<a name="8.0.0"></a>
# [8.0.0](https://github.com/tivac/modular-css/compare/v7.2.0...v8.0.0) (2018-02-09)


### Features

* Exporting values. ([#396](https://github.com/tivac/modular-css/issues/396)) ([#398](https://github.com/tivac/modular-css/issues/398)) ([4a15d8f](https://github.com/tivac/modular-css/commit/4a15d8f))
* External source maps ([#326](https://github.com/tivac/modular-css/issues/326)) ([8df5baa](https://github.com/tivac/modular-css/commit/8df5baa))


### BREAKING CHANGES

* Values will now be exported alongside composed classes




<a name="7.2.0"></a>
# [7.2.0](https://github.com/tivac/modular-css/compare/v7.1.0...v7.2.0) (2017-12-13)


### Bug Fixes

* rollup watching loses file contents ([#377](https://github.com/tivac/modular-css/issues/377)) ([347ee8d](https://github.com/tivac/modular-css/commit/347ee8d))


### Features

* **modular-css-core:** processor.remove returns removed files ([#376](https://github.com/tivac/modular-css/issues/376)) ([b560651](https://github.com/tivac/modular-css/commit/b560651))




<a name="7.1.0"></a>
# [7.1.0](https://github.com/tivac/modular-css/compare/v7.0.0...v7.1.0) (2017-12-11)


### Bug Fixes

* onwrite not returning the promise ([9ab15de](https://github.com/tivac/modular-css/commit/9ab15de))


### Features

* Svelte preprocess support ([#374](https://github.com/tivac/modular-css/issues/374)) ([0216a0c](https://github.com/tivac/modular-css/commit/0216a0c))




<a name="7.0.0"></a>
# [7.0.0](https://github.com/tivac/modular-css/compare/v6.1.0...v7.0.0) (2017-11-16)


### Bug Fixes

* Overlapping value replacement ([#365](https://github.com/tivac/modular-css/issues/365)) ([1f6fdb5](https://github.com/tivac/modular-css/commit/1f6fdb5)), closes [#363](https://github.com/tivac/modular-css/issues/363)


### Features

* add rewrite option ([#368](https://github.com/tivac/modular-css/issues/368)) ([9bae543](https://github.com/tivac/modular-css/commit/9bae543))


### BREAKING CHANGES

* To prevent `postcss-url` from running you now specify `rewrite: false` instead of defining an `after` segment.
