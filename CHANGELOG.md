# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [28.0.0](https://github.com/tivac/modular-css/compare/v27.2.0...v28.0.0) (2022-02-25)


### Code Refactoring

* **svelte:** <style> tags need type="text/m-css" ([713b107](https://github.com/tivac/modular-css/commit/713b10716d33829cdc1a796e557348dcb2f8450f))
* **svelte:** break apart a bit ([5f74c1e](https://github.com/tivac/modular-css/commit/5f74c1eefc38af3627ac19847fa288dff2b1155a))


### Features

* **svelte:** parses imports now ([a4023a1](https://github.com/tivac/modular-css/commit/a4023a1a5f671ffff2d3b420e059860012d5b7f9))
* **www:** Heading ids are hierarchical ([#814](https://github.com/tivac/modular-css/issues/814)) ([41b3199](https://github.com/tivac/modular-css/commit/41b31992ccbbdf49287f591c1e63fbe9307a3095))


### BREAKING CHANGES

* **svelte:** Having both `<style type="text/m-css">` **and** a `<link>` element in a component will no longer throw. `<style>` takes precedence over `<link>`.
* **svelte:** Previous all `<style>` tags would be transformed, now only ones that have `type="text/m-css"` on them will be transformed.





# [27.2.0](https://github.com/tivac/modular-css/compare/v27.1.1...v27.2.0) (2022-02-13)


### Bug Fixes

* **path-aliases:** escape regex characters ([fecbf3b](https://github.com/tivac/modular-css/commit/fecbf3b7eba084e8a5637fcfa7a8806e0ad95cd5))
* **svelte:** escape regex characters ([9345aed](https://github.com/tivac/modular-css/commit/9345aeddb6147d228fd6c973f7411f29bf2a3730))


### Features

* **www:** add sveltekit aliases ([695c69b](https://github.com/tivac/modular-css/commit/695c69b3343336beaf6dd536b2a94ea702fae201))
* **www:** notifier for imported .md files ([cd1f948](https://github.com/tivac/modular-css/commit/cd1f948a1ff5e76c574da011f475c523bb18876d))





## [27.1.1](https://github.com/tivac/modular-css/compare/v27.1.0...v27.1.1) (2022-02-09)


### Bug Fixes

* **vite:** non-win32 file resolution ([#809](https://github.com/tivac/modular-css/issues/809)) ([115c517](https://github.com/tivac/modular-css/commit/115c517ca5f4586619db2207d1d37675981237c6))





# [27.1.0](https://github.com/tivac/modular-css/compare/v27.0.3...v27.1.0) (2022-02-03)


### Bug Fixes

* **processor:** cleaning up ([897a2c5](https://github.com/tivac/modular-css/commit/897a2c52acc1b507452654c48360e469e2468a69))
* **svelte:** support non .css extensions ([8bf5a18](https://github.com/tivac/modular-css/commit/8bf5a180caf9f4d8445f5596c9f16833cdcb6783))
* **test-utils:** don't try to check non-strings ([4fb497e](https://github.com/tivac/modular-css/commit/4fb497edce27e2d7a72c65e8c6394f7eb712db6a))
* **webpack:** remove deprecated cjs option ([3489907](https://github.com/tivac/modular-css/commit/3489907e69ccd2fec69fc015cefbb6b87225cc3e))


### Features

* **css-to-js:** extract css-to-js from rollup ([85aac89](https://github.com/tivac/modular-css/commit/85aac8966adf73f22ed599fa3884db97530c208d))
* **vite:** vite plugin ([46c80da](https://github.com/tivac/modular-css/commit/46c80dab3c552b5ddf2c43683984d6c9112ecd39))
* **www:** m-css.com on sveltekit ([d434f92](https://github.com/tivac/modular-css/commit/d434f927a4201df8d66cd7ed5ea2be63daa42b7a))





## [27.0.3](https://github.com/tivac/modular-css/compare/v26.0.0...v27.0.3) (2021-12-17)


### Bug Fixes

* **www:** get REPL working again ([#797](https://github.com/tivac/modular-css/issues/797)) ([c6ffbb5](https://github.com/tivac/modular-css/commit/c6ffbb54a025f4809c7a6a9d12606e54fa1d2d28))


### Code Refactoring

* postcss8 native support ([#795](https://github.com/tivac/modular-css/issues/795)) ([331b833](https://github.com/tivac/modular-css/commit/331b833e8de6a4f952be0735441c5d7589aa2ed0))


### BREAKING CHANGES

* - Only supports `postcss@8` and higher
- `composes` and `@values` that reference other entries will need to be listed in dependency order.





## [27.0.2](https://github.com/tivac/modular-css/compare/v27.0.1...v27.0.2) (2021-07-18)


### Bug Fixes

* support complex [@value](https://github.com/value) replacements ([06eb52c](https://github.com/tivac/modular-css/commit/06eb52ccf63ca6de2828d50abded6b79070e1e4d))





## [27.0.1](https://github.com/tivac/modular-css/compare/v27.0.0...v27.0.1) (2021-07-18)


### Bug Fixes

* local references as references ([aeba154](https://github.com/tivac/modular-css/commit/aeba154d07e53c76643f2838621a30c4dcec0c36))
* **www:** get REPL working again ([#797](https://github.com/tivac/modular-css/issues/797)) ([c6ffbb5](https://github.com/tivac/modular-css/commit/c6ffbb54a025f4809c7a6a9d12606e54fa1d2d28))





# [27.0.0](https://github.com/tivac/modular-css/compare/v26.0.0...v27.0.0) (2021-07-06)


### Bug Fixes

* [@composes](https://github.com/composes) working again ([f48bc5f](https://github.com/tivac/modular-css/commit/f48bc5f9b6515c9fa7ce4581258ba02fa58f05b7))
* [@keyframes](https://github.com/keyframes) can be anywhere ([b6dddc7](https://github.com/tivac/modular-css/commit/b6dddc759233f7148f0add32104a23c41d923a19))


### Code Refactoring

* remove postcss as dep ([ca67c39](https://github.com/tivac/modular-css/commit/ca67c39dee4b98e0528e2543e556e735f2ed8bf8))


### Features

* Add .warnings to processor ([eb0e117](https://github.com/tivac/modular-css/commit/eb0e1174ea10892d396c87298508bba1acd233ae))


### BREAKING CHANGES

* - Requires `postcss@8` be installed alongside to function.





# [26.0.0](https://github.com/tivac/modular-css/compare/v25.8.2...v26.0.0) (2021-02-25)


### Bug Fixes

* **svelte:** Match missed classes to word boundaries ([#780](https://github.com/tivac/modular-css/issues/780)) ([#783](https://github.com/tivac/modular-css/issues/783)) ([1ac9af5](https://github.com/tivac/modular-css/commit/1ac9af5f1bf679e677b6fd1e7631802d3db56551))


### Features

* fine-grained dependency tracking ([597ae42](https://github.com/tivac/modular-css/commit/597ae42183b4c15bee368609a84e4e991b497e30))
* postcss@8 support ([#789](https://github.com/tivac/modular-css/issues/789)) ([340a38e](https://github.com/tivac/modular-css/commit/340a38e45bbb64d2e1ee7fc82882995383466bd3))


### BREAKING CHANGES

* postcss@8 drops support for node version 6.x, 8.x, 11.x, and 13.x.





## [25.8.2](https://github.com/tivac/modular-css/compare/v25.8.1...v25.8.2) (2020-09-02)


### Bug Fixes

* **processor:** don't scope [@keyframes](https://github.com/keyframes) contents ([#781](https://github.com/tivac/modular-css/issues/781)) ([dd41bf1](https://github.com/tivac/modular-css/commit/dd41bf111158be235fa50c52d10c6ca203994e4f))





## [25.8.1](https://github.com/tivac/modular-css/compare/v25.8.0...v25.8.1) (2020-07-30)


### Bug Fixes

* **rollup:** update peerDep to rollup@2 ([#777](https://github.com/tivac/modular-css/issues/777)) ([69ee5c4](https://github.com/tivac/modular-css/commit/69ee5c455f4583d72bbb02ce4435c4625c1e31d6))





# [25.8.0](https://github.com/tivac/modular-css/compare/v25.7.0...v25.8.0) (2020-06-29)


### Bug Fixes

* remove rule if there's no other decls ([#769](https://github.com/tivac/modular-css/issues/769)) ([9215873](https://github.com/tivac/modular-css/commit/92158730cb38947ed8aba03e1b6fa56501a711f0))


### Features

* **svelte:** warn on non ".css" <link href>  ([#766](https://github.com/tivac/modular-css/issues/766)) ([1ac0e4d](https://github.com/tivac/modular-css/commit/1ac0e4dde2f995f3b422d1d14bbece066c2704f9))





# [25.7.0](https://github.com/tivac/modular-css/compare/v25.6.0...v25.7.0) (2020-05-15)


### Features

* Support escaped characters in composed class names ([#755](https://github.com/tivac/modular-css/issues/755)) ([6cd4d8a](https://github.com/tivac/modular-css/commit/6cd4d8acc16abc9ac51c778a0b7f42a4c07088e4))





# [25.6.0](https://github.com/tivac/modular-css/compare/v25.4.1...v25.6.0) (2020-04-21)


### Bug Fixes

* **processor:** better error :external can't find a file ([469c859](https://github.com/tivac/modular-css/commit/469c8597d0535a2e1b723ee8ebb974326cddefdb))
* **processor:** better error when importing missing [@value](https://github.com/value) ([0d06afa](https://github.com/tivac/modular-css/commit/0d06afa675808847769b00e9e35c29961494193c))
* **rewriter:** don't explode on external chunks ([#749](https://github.com/tivac/modular-css/issues/749)) ([be741bb](https://github.com/tivac/modular-css/commit/be741bbf8423bf6b3b9af04de4f3f494554ff2f8)), closes [#688](https://github.com/tivac/modular-css/issues/688)
* **rollup:** walk full tree for dependencies ([#748](https://github.com/tivac/modular-css/issues/748)) ([3ba7c3e](https://github.com/tivac/modular-css/commit/3ba7c3e0b5f717e2a29357cc00a9617a63142d34))
* **svelte:** case-sensitive matching on <link> ([#744](https://github.com/tivac/modular-css/issues/744)) ([8577e3f](https://github.com/tivac/modular-css/commit/8577e3f3bf8c151192ad71df940dcafcc58a1dd7)), closes [#711](https://github.com/tivac/modular-css/issues/711)
* **webpack:** don't try to emit if there were errors ([#725](https://github.com/tivac/modular-css/issues/725)) ([e9de291](https://github.com/tivac/modular-css/commit/e9de2917481d62dac1a7aa02d946371518a7b66c)), closes [#724](https://github.com/tivac/modular-css/issues/724)
* **www:** better font, faster load ([0237987](https://github.com/tivac/modular-css/commit/0237987d9b2869502483bc162645a1cf7ae2ab11))
* **www:** corrected font sizing ([b97149e](https://github.com/tivac/modular-css/commit/b97149ea45931c0cf9a98a0afcc5564eb5b1c30c))


### Features

* **core:** Add support for aliasing values ([#737](https://github.com/tivac/modular-css/issues/737)) ([597c1ae](https://github.com/tivac/modular-css/commit/597c1aec95ae6c8bec584d862df17a44921dfa6d)), closes [#719](https://github.com/tivac/modular-css/issues/719) [#736](https://github.com/tivac/modular-css/issues/736)
* **rollup:** rollup@2 compat ([#733](https://github.com/tivac/modular-css/issues/733)) ([361bd4e](https://github.com/tivac/modular-css/commit/361bd4e457050b76d94d5ab7193780666e786727))
* **website:** port site to svelte3 ([35e7a96](https://github.com/tivac/modular-css/commit/35e7a9677d700772cb6f9a06e35d2b14b0283494))





# [25.5.0](https://github.com/tivac/modular-css/compare/v25.4.1...v25.5.0) (2020-03-09)


### Bug Fixes

* **processor:** better error :external can't find a file ([469c859](https://github.com/tivac/modular-css/commit/469c8597d0535a2e1b723ee8ebb974326cddefdb))
* **processor:** better error when importing missing [@value](https://github.com/value) ([0d06afa](https://github.com/tivac/modular-css/commit/0d06afa675808847769b00e9e35c29961494193c))
* **webpack:** don't try to emit if there were errors ([#725](https://github.com/tivac/modular-css/issues/725)) ([e9de291](https://github.com/tivac/modular-css/commit/e9de2917481d62dac1a7aa02d946371518a7b66c)), closes [#724](https://github.com/tivac/modular-css/issues/724)
* **www:** better font, faster load ([0237987](https://github.com/tivac/modular-css/commit/0237987d9b2869502483bc162645a1cf7ae2ab11))
* **www:** corrected font sizing ([b97149e](https://github.com/tivac/modular-css/commit/b97149ea45931c0cf9a98a0afcc5564eb5b1c30c))


### Features

* **website:** port site to svelte3 ([35e7a96](https://github.com/tivac/modular-css/commit/35e7a9677d700772cb6f9a06e35d2b14b0283494))





## [25.4.1](https://github.com/tivac/modular-css/compare/v25.4.0...v25.4.1) (2020-02-12)

**Note:** Version bump only for package modular-css





# [25.4.0](https://github.com/tivac/modular-css/compare/v25.3.1...v25.4.0) (2020-02-05)


### Features

* add `.root()` to avoid re-parsing inputs when possible ([#717](https://github.com/tivac/modular-css/issues/717)) ([fdb010b](https://github.com/tivac/modular-css/commit/fdb010b))





## [25.3.1](https://github.com/tivac/modular-css/compare/v25.3.0...v25.3.1) (2020-01-23)


### Bug Fixes

* **processor:** don't assume `plugin` key on messages ([#712](https://github.com/tivac/modular-css/issues/712)) ([3a5279c](https://github.com/tivac/modular-css/commit/3a5279c))





# [25.3.0](https://github.com/tivac/modular-css/compare/v25.2.0...v25.3.0) (2019-11-26)


### Features

* **svelte:** warn on unquoted class attributes ([#690](https://github.com/tivac/modular-css/issues/690)) ([846f4db](https://github.com/tivac/modular-css/commit/846f4db))





# [25.2.0](https://github.com/tivac/modular-css/compare/v25.1.0...v25.2.0) (2019-10-30)


### Bug Fixes

* **www:** get site building again ([#682](https://github.com/tivac/modular-css/issues/682)) ([79b3c50](https://github.com/tivac/modular-css/commit/79b3c50))


### Features

* Custom file reader api ([#671](https://github.com/tivac/modular-css/issues/671)) ([f1865c9](https://github.com/tivac/modular-css/commit/f1865c9))
* **processor:** add processor.resolve() ([#681](https://github.com/tivac/modular-css/issues/681)) ([2c5a51d](https://github.com/tivac/modular-css/commit/2c5a51d)), closes [#679](https://github.com/tivac/modular-css/issues/679)
* exportDefault flag for webpack loader ([#680](https://github.com/tivac/modular-css/issues/680)) ([0179f99](https://github.com/tivac/modular-css/commit/0179f99))





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
