# Changes

## 5.1.2

- refactor: no recursion during .remove() (#306)
- fix: Recursive remove (#301) (Bogdan Chadkin)

## 5.0.0

- chore: :package: resolve-from@3.0.0

## 5.0.0-rc1

- refactor: Use absolute paths internally (#300)

## 4.3.0

- chore: remove changes, it doesn't make sense in lerna
- feat: exportGlobals option in core (#287) (Bogdan Chadkin)

## 4.2.2

- style: more arrow fns, thanks
- fix: support multiple :global(...) in a selector (#281)
- fix: allow comments before composes in a rule (#274)
- chore: :package: eslint@3.18.0 & danger@0.14.1
- chore: ignore generated code for coverage
- test: use snapshots wherever possible (#272)
- fix: More flexible postcss support for options (#271)
- test: test json option with full postcss processor
- chore: :package: eslint-config-arenanet@3.3.1
- test: Use jest for testing (#269)
- docs: remove changes now that it's unused
- fix: avoid dependencies going missing with rollup (#266)
- fix: add missing esutils dep
- remove some gunk
- fix: pseudos other than :external in a selector are ok (#263)
- docs: try it links and adjust section order
- fix: wrong comment style, oops
- feat: new domain, export tab, cleaned scripts (#262)
- docs: document new string support for namer option
- fix: ignore some more things
- feat: namer can be a string, will be passed to require()
- docs: fix typo
- docs: adjust links again
- docs: fix readme links
- chore: break build up a bit more
- feat: header links to repo
- feat: styling pass
- chore: update lerna metadata as well, oops.
- chore: :package: lerna@2.0.0-beta.38
- fix: early-out from keyframe renaming if no work to do (#259)
- Add a simple site (#258)
- feat: add ability to disable file caching in browserify
- refactor: smaller output by using more characters, duh.

## ???

- docs: fix paths description

## ??

- chore: switch to independent mode
- feat: Add modular-css-paths to solve pathing pain (#255)

## 4.1.1

- fix: file 26 would get "undefined" as a name

## 4.1.0

- feat: bring modular-css-namer into the fold(#254)
- docs: reformat postcss readme to make sense
- chore: revert accidental experiment

## 4.0.4

- docs: clean up badge situation

## 4.0.3

- docs: fix david badges (by removing them)

## 4.0.2


## 4.0.1

- docs: customize readmes per package, clean up a bit
- fix: clean up some stale references
- fix: clarify bin name for modular-css-cli
- chore: ensure everything has a license

## 4.0.0

- refactor: convert to separate packages using lerna (#253)

- docs: resolvers documentation

## 3.2.0

- test: danger should ignore this lack of strictness (#251)
- fix: barf in a nicer manner for webpack (#250)
- feat: Add support for custom resolvers (#249)

## 3.1.0

- fix: smarter value matching (#247)

## 3.0.2

- fix: singular selector composition check too strict

## 3.0.1

- fix: over-complicate key creation, inodes are a lie (#243)

## 3.0.0

- feat: make multiple composition a crime (#241)
- chore: properly ignore test dir
- chore: :package: husky@0.13.1
- chore: match up with webpack output changes
- refactor: use webpack assets prop (#234)
- chore(package): update browserify to version 14.0.0 (#239) (greenkeeper[bot])
- feat: use danger-js to validate pull requests (#237)

- chore: allowing previewing of changes for next version
- chore(package): update rollup to version 0.41.1 (#236)

## 2.0.2

- docs: Update readme wording & add feature examples

## 2.0.1

- chore: Screwed that up, oops.
- docs: formatting tweak
- refactor: Change how webpack works to make it less weird
- chore: update rollup-pluginutils to version 2.0.0 (#233) (greenkeeper[bot])
- chore: update rollup to version 0.40.0 (#232) (greenkeeper[bot])

## 1.0.1

- docs: updated description

## 1.0.0

- fix: generate parser before running tests
- feat: Webpack Plugin (#231)
- test: switch to nyc for coverage
- test: tests for CLI implementation
- refactor: use meow for CLI instead
- docs: PostCSS plugin docs
- feat: better postcss options support
- docs: fix bad regex
- feat: PostCSS Plugin (#230)

## 0.29.1

- chore: update rollup to version 0.39.2 (#229)
- Differences between CSS Modules/modular-css
- Indentation
- Wording :pencil2:
- chore(package): update rollup to version 0.38.0 (#224) (greenkeeper[bot])
- chore(package): update rollup to version 0.37.0 (#223) (Greenkeeper)
- Ensure that nodes have sources
- Handle CLI errors
- Use bare function PostCSS plugins
- Give after/done hooks more data
- PostCSS doesn't like Object.create(null)
- Inline comment source creation
- Fix error reporting in initial walk of graph (#218)
- Update for features in 0.29.0

## 0.29.0

- :wave: bye node 5
- Arrow fns everywhere
- Emptying out objects w/ Object.create(null)
- Add :external(<selector> from <file>) support (#212)
- PEG.js parser, namespaces, cleanup (#210)

## 0.28.3

- Properly scope multiple animations in a single declaration (#209)

## 0.28.2

- Global can overlap global, local can overlap local (#206)

## 0.28.1

- Make default namer assignment more safe


## 0.28.0

- Replace local @value entries in @value rules (#204)
- Dedupe dependency graph using inodes (#203)
- postcss@5.2.5 (#202) (Greenkeeper)
- Add node 6 as a test target
- Document all rollup options
- chore(package): update eslint to version 3.8.0 (#200) (Greenkeeper)
- Remove lodash.assign (#199)
- chore(package): update rollup to version 0.36.0 (#197) (Greenkeeper)
- rollup@0.35.15 breaks build 🚨 (#196) (Greenkeeper)
- Add features link
- Update and rename css-modules.md to features.md
- Throw if a selector is used locally and globally (#194)

## 0.27.2

- Hack in rollup-watch support (#193)
- Create LICENSE
- chore(package): update rollup to version 0.35.3 (#189) (Greenkeeper)

## 0.27.1

- Re-work reference storing so globals are prefixed (#185)
- Fix example typo :pencil2:

## 0.27.0

- docs: break apart to improve clarity (#182)
- refactor: use cwd for .glob() (#181)
- refactor: Remove Promise polyfill (#180)

## 0.26.0

- Better handle errors within rollup (#178)
- chore(package): update mocha to version 3.0.0 (#177) (Greenkeeper)
- chore(package): update shelljs to version 0.7.3 (#176) (Greenkeeper)
- Add unicode test for processor (#175)

## 0.25.0

- Add CLI --json entry for output compositions

## 0.24.0

- postcss@5.1.0 (#157) (Greenkeeper)
- chore(package): update eslint-config-arenanet to version 3.0.0 (#173) (Greenkeeper)
- CLI globbing (#174)

## 0.23.2

- Fix accidental test exclusion
- Use rollup ongenerate & onwrite hooks (#156)

- Clean up readme some :pencil2:

## 0.23.1

- ???

## 0.23.0

- Include dependencies in output (#154)

- chore(package): update eslint to version 3.0.0 (#153) (Greenkeeper)
- chore(package): update rollup to version 0.33.0 (#152) (Greenkeeper)

## 0.22.1

- postcss-url has vulnerable deps, but no easy fix
- Use publish-please for safety/sanity

## 0.22.0

- Add strict mode concept (#149)
- Use mocha's promise behavior
- Update rollup to version 0.32.0 🚀 (#147) (Greenkeeper)
- chore(package): update eslint to version 2.12.0 (#143) (Greenkeeper)
- chore(package): update update-notifier to version 1.0.0 (#146) (Greenkeeper)
- chore(package): update eslint to version 2.11.1 (#135) (Greenkeeper)
- Silence ESLint warnings
- Restructure directories and general clean-up (#134)

## 0.21.1

- Rework scoped selector plugin (#133)
- Remove profiling artifacts
- Ignore profiling artifacts
- chore(package): update lodash.mapvalues to version 4.4.0 (#130) (Greenkeeper)
## SCode config file

## 0.21.0


## 0.20.1

- Track sources for @value rules (#129)


## 0.20.0

- Fix rollup plugin arg to just be `map`
- :package: postcss@5.0.21

- Sourcemaps cleanup pass (#128)
- chore(package): update update-notifier to version 0.7.0 (#127) (Greenkeeper)
- Update postcss-selector-parser to version 2.0.0 🚀 (#126) (Greenkeeper)
- chore(package): update dependency-graph to version 0.5.0 (#123) (Greenkeeper)
- Only write if a file was passed
- 4.3 => 4.4, Add 5
- chore(package): update shelljs to version 0.7.0 (#122) (Greenkeeper)
- chore(package): update rollup to version 0.26.0 (#121) (Greenkeeper)

## 0.19.0

- Output in stable order (#120)

## 0.18.0

- API tweak, link fix
- Add compositions to .output() (#118)

## 0.17.1

- ???

## 0.17.0

- Fixing readme anchors
- chore(package): update sink-transform to version 2.0.0 (#115) (Greenkeeper)
- Only export valid identifiers from rollup plugin (#116)
- chore(package): update eslint to version 2.8.0 (#112) (Greenkeeper)
- chore(package): update lodash.get to version 4.2.1 (#106) (Greenkeeper)
- Ditch JSCS, it and ESLint are merging someday
- Rollup exports individual declarations as well (#114)
- Case-sensitivity oy vey
- Fix dumb CLI bug
- Move test around
- Use new _output module
- Remove trailing done reference
- Standardize generation of file -> output map
- More promises!
- Add a test to help verify something
- Take advantage of mocha promise understanding

## 0.16.0

- Fix symlinked files w/ browserify (#107)
- :package: lodash.mapvalues@4.3.0 (Greenkeeper)
- eslint@2.5.3
- chore(package): update eslint to version 2.5.0 (greenkeeperio-bot)

## 0.15.0

- Ehhhhhhhh
- Make bithound happier
- Add complex value test (commas/quotes)
- Add require hook documentation
- Add require() hook to load css

## 0.14.0

- Remove export stripping

## 0.13.0

- More clean-up
- Restructuring
- Update README.md
- Allow specifying CWD
- Update travis to latest LTS
- chore(package): update lodash.filter to version 4.2.1 (greenkeeperio-bot)

## 0.12.3

- Add rollup plugin docs
- First pass at rollup plugin
- Ignore .vscode folder
- A note on versioning
- Corrected browserify plugin usage

## 0.12.2

- Sort JSON output by file as well

## 0.12.1

- Sort output before generating so it's stable

## 0.12.0

- Rework lifecycle to before/after/done
- :package: jscs@2.10.1
- chore(package): update eslint-config-arenanet to version 2.0.2 (greenkeeperio-bot)
- chore(package): update lodash.uniq to version 4.2.0 (greenkeeperio-bot)
- chore(package): update jscs to version 2.10.0 (greenkeeperio-bot)
- Code cleanup for eslint@2.x
- Update ESLint config for eslint@2.x
- chore(package): update eslint to version 2.0.0 (greenkeeperio-bot)
- chore(package): update shelljs to version 0.6.0 (greenkeeperio-bot)
- Update README.md

## 0.11.2

- Tests and improving code coverage
- Spec fix

## 0.11.1

- Source map details
- Simple source maps test :school:
- ESlint fix :police_car: :pencil:
- CLI should default to inline sourcemaps
- Ensure that options are always merged in

## 0.11.0

- .css() :arrow_right: .output()
- Process afters against the complete output
- Update README.md
- Document missing portions of the API :pencil:

## 0.10.6

- ???

## 0.10.5

- Apparently NPM requires the shebang

## 0.10.4

- Lint cleanup
- Kick CLI into the brave new world of promises
- Actually declare that we have a bin file

## 0.10.3


## 0.10.2

- Ensure that JSON output is strings
- Let's try deploying from travis

## 0.10.1

- Don't explode on unknown files in remove() calls
- Update README.md

## 0.10.0

- Remove unused var :police_car: :pencil:
- Only remove if selector isn't used again
- chore(package): update postcss-url to version 5.1.0 (greenkeeperio-bot)
- Remove global transform :globe_with_meridians:
- emit file events & push rows into streams
- Give #24 its own file
- Linter cleanup :police_car: :pencil:
- Fix processor tests :tada:
- Fixed up watchify tests :wrench:
- Better after() usage
- Got factor-bundle tests working now :ok_hand:
- Fix extension naming when no extension exists
- Centralize file-reading in Processor :file_folder:
- Easily creating readable streams
- Move tests all around like a crazy person :confounded:
- Browserify creates output dirs now
- Fix a bad function name
- Non-broken arenanet preset version
- chore(package): update jscs-preset-arenanet to version 1.0.2 (greenkeeperio-bot)

## 0.9.0

- :package: lodash@4.0.1
- Support postcss async plugins
- chore(package): update lodash.uniq to version 4.0.1 (greenkeeperio-bot)
- chore(package): update lodash.difference to version 4.0.1 (greenkeeperio-bot)
- :package: istanbul@0.4.2 watchify@3.7.0
- chore(package): update browserify to version 13.0.0 (greenkeeperio-bot)

## 0.8.0

- Run linter/tests before cutting a new version
- Add before/after for running postcss plugins

## 0.7.5

- Run all the tests, yo.
- postcss@5.0.14 jscs@2.8.0 :package:
- Fix + tests for #35

- keyword gunk

## 0.7.4

- Hold onto bundler ref for nicer errors :feelsgood:

- postcss@5.0.13 postcss-value-parser@3.2.3 :package:

## 0.7.3

- Add processor.remove & use in browserify
- Test for watchify caching issue
- Fix watchify caching issue

## 0.7.2

- Use factor-bundle bundling logic

## 0.7.1

- Fix logic determining which files to include
- Add some test helpers
- Clean up output dir before running browserify tests

## 0.7.0

- :pencil2: Exports are now space-separated strings
- Change exports to be space-separated strings

## 0.6.1

- Break apart value processing

## 0.6.0

- chore(package): update update-notifier to version 0.6.0 (greenkeeperio-bot)
- Can't forget the "mc" prefix to keep things valid
- Finish fixing up tests
- Updating hashes
- Use unique-slug instead of hasha

## 0.5.1

- Prefix hash with "mc" so it's always valid

- Correct browserify usage :boom:
- :construction:
- :construction_worker:

## 0.5.0

- Use postcss-value-parser instead of regexes
- Use sink-transform instead of manually handling

## 0.4.1

- Two graphs was dumb.

## 0.4.0

- Actual tests for multiple composes statements
- Add support for composes: global(selector);
- @keyframes scoping/rewriting support

## 0.3.0

- Browserify transform can write out empty files
- Processor.css() takes an object

## 0.2.0

- Add some tests for processor passing scoping args
- Passing prefix/namer through all the layers
- Plumbing through naming function to postcss
- Fix up :global() support and add tests
- Match css-modules behavior on scoping
- Fixed line endings
- Fixed eol attribute
- Update README.md

## 0.1.0

- Add factor-bundle documentation :pencil2:
- Support factor-bundle plugin

- Show master branch build status
- Local composition
- :pencil2:
- Support adding multiple files
- \n, not \r\n
- Simplify default css file name
- Add update-notifier as an experiment
- Better JSON output name
- Usage examples and other readme tweaks
- Flesh out some missing package.json fields
- Badges
- Disable 5.0 builds until mock-fs is updated
- Add travis config
- Add browserify transform
- Export the import API as `process()`
- Add an actual (very basic) CLI
- DRY this up a bit
- Update package.json
- Update README.md
- Create README.md
- Code coverage & sanity
- Code coverage and ensure that IDs work
- Extract function into upper scope
- Rework scoping to expressly handle invalid selectors
- More tests for full importing path
- Remove concept of "root", it's redundant
- Test import response w/ a hierarchy
- Correct composition hierarchy output
- Updated dep
- Use node-style resolve, more tests
- Move node_modules test specimen
- Missing test specimen
- Early-out if no @value rules.
- Test specimen
- Testing imports somewhat
- Composition cleanup & imports support
- More useful export, node-style resolution
- value support for reading from imports
- Basic imports support seems to be working
- Remove imports plugin
- Renaming tests for plugins
- Better handling of invalid value definitions
- Start fumbling my way through imports
- Extract regexp
- Better output, starting on import plugin
- Simple CLI runner
- value implementation & tests!
- Run all tests
- Only use mocha when we care
- Composition working
- Test cleanup
- require ordering
- Fix linting via editors
- ESLint
- ESLint cleanup
- Scoping rules seem to work!
- Starting work on refactoring into multiple plugins
- Way too simple support for @value
- More granular test files
- Basic class rewriting & composition working
- Trying out some ideas
- :confetti_ball: Added .gitattributes & .gitignore files
