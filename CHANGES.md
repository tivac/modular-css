# Changes

## 1.0.0

- refactor: remove version lifecycle stuff
- refactor: Use ES2015 exports in webpack (#282)
- chore: Update a bunch of packages (#283)

    * chore: :package: updates

    * chore: more :package: updates to match reality

    Also removes some annoying lerna notifications

- style: more arrow fns, thanks
- fix: support multiple :global(...) in a selector (#281)
- chore: :package: lerna@2.0.0-rc.3
- test: update snapshots since webpack output changed
- chore: update danger to version 0.15.0 (#275) (greenkeeper[bot])

    https://greenkeeper.io/
- $(echo Publish
- fix: allow comments before composes in a rule (#274)

    Fixes #273
- chore: :package: eslint@3.18.0 & danger@0.14.1
- chore: ignore generated code for coverage
- test: use snapshots wherever possible (#272)

    * test: glob snapshotting

    * test: move cli tests to snapshots

    * test: updated namer to use snapshots

    * test: convert paths to use snapshots

    * test: remove some machine-dependent snapshotting

    * test: postcss using snapshots

    * test: browserify using test-utils/read instead of local

    * test: rollup testing using (mostly) snapshots

    * test: webpack using snapshots

    * test: start converting some core tests to snapshots

    * test: more core snapshotting

    * test: more core snapshotty bits

    * style: lint cleanup

    * refactor: all file references are relative

    For easier portability/reading/etc

    * test: methods using snapshots

    * test: remove some repetition

    * test: styling and clearer names

    * test: fix up relative pathing woes for graph-nodes

    * test: style and naming fixes

    * test: better naming

    * test: snapshots for externals tests

    * test: safer snapshots and smaller selectors

    * test: tighten up some selector names

    * style: lint cleanup

    * test: make options tests use snapshots

    * test: main processor tests using snapshots

    * test: remove some repetition

    * test: fix broken syntax

    * fix: fix some fallout from relative path cut-over

    * style: remove eslint directive

    * fix: attempt to solve some of the relative pathing madness

    * fix: browserify uses absolute, processor is relative

    Now we're at some sort of happy medium, more or less

    * fix: don't make EVERY path relative, just necessary ones

    * style: clean up some weirdness

    * style: fix lint issue

    * style: explain why tests are written strangely

    * test: removing old results files

    * style: fix comment typo

    * refactor: remove old comparison test util

    * refactor: :wave: to another unused test util

    * test: standardize on test-utils/namer.js when possible

    * test: fix up merge artifacts

- $(echo Publish
- fix: More flexible postcss support for options (#271)

    * feat: expose processor.options as a getter

    * refactor: use combined processor.options.json

- test: test json option with full postcss processor

    #270

- chore: :package: eslint-config-arenanet@3.3.1
- test: Use jest for testing (#269)
- docs: remove changes now that it's unused
- $(echo Publish
- fix: avoid dependencies going missing with rollup (#266)
- $(echo Publish
- fix: add missing esutils dep

    Fixes #264

- remove some gunk
- $(echo Publish
- fix: pseudos other than :external in a selector are ok (#263)

    Fixes #261 
- docs: try it links and adjust section order
- fix: wrong comment style, oops
- $(echo Publish
- feat: new domain, export tab, cleaned scripts (#262)
- docs: document new string support for namer option
- fix: ignore some more things
- feat: namer can be a string, will be passed to require()
- docs: fix typo
- docs: adjust links again
- docs: fix readme links

    Fixes #260
- chore: break build up a bit more
- feat: header links to repo
- feat: styling pass
- chore: update lerna metadata as well, oops.
- chore: :package: lerna@2.0.0-beta.38
- $(echo Publish
- fix: early-out from keyframe renaming if no work to do (#259)

    Otherwise the regex ends up broken and matches everything, then replaces everything with nothing because there's no way it could match.

    Fixes #256
- $(echo Publish
- Add a simple site (#258)

    http://loud-yak.surge.sh
- feat: add ability to disable file caching in browserify

    Fixes #226

- refactor: smaller output by using more characters, duh.

    Inspired by #246

- $(echo v%s)
- docs: fix paths description
- $(echo v%s)
- chore: switch to independent mode
- feat: Add modular-css-paths to solve pathing pain (#255)

    Fixes #252
- $(echo v4.1.1)
- fix: file 26 would get "undefined" as a name
- $(echo v4.1.0)
- feat: bring modular-css-namer into the fold(#254)
- docs: reformat postcss readme to make sense
- chore: revert accidental experiment
- $(echo v4.0.4)
- docs: clean up badge situation
- $(echo v4.0.3)
- docs: fix david badges (by removing them)
- $(echo v4.0.2)
- $(echo v4.0.1)
- docs: customize readmes per package, clean up a bit
- fix: clean up some stale references
- fix: clarify bin name for modular-css-cli
- chore: ensure everything has a license
- $(echo v4.0.0)
- refactor: convert to separate packages using lerna (#253)

    * refactor: break into lerna packages

    :warning: 100% broken, guaranteed :warning:

    * test: move around results/specimens/configs

    * test: move more files, create more infrastructure

    * refactor: clean up core package.json

    * test: break out test-utils, set up more metadata

    * test: get core package testing ok

    * test: core, glob, rollup tests passing!

    * refactor: get browserify & tests running

    * refactor: get postcss running

    * refactor: webpack working

    * test: get test-utils working again

    * chore: update some versions

    * chore: set lerna version

    * chore: get some bits and pieces squared away

    * chore: fix up travis dependencies

    * refactor: cli tests working again

    * refactor: fix browserify pkg name

    * refactor: add bundle to takes over modular-css pkg

    Still nice to provide an all-in-one option to ease the transition!

    * refactor: arrow-fn up glob

    * refactor: move some deps around to fix build

    * chore: fix up danger and remove false-positives

- docs: resolvers documentation
- v3.2.0
- test: danger should ignore this lack of strictness (#251)
- fix: barf in a nicer manner for webpack (#250)

    Fixes #248
- feat: Add support for custom resolvers (#249)

    Fixes #246 
- v3.1.0
- fix: smarter value matching (#247)

    * fix: value replacement does less naive matching
    * style: cleaner regex creation
    * chore: replace common-tags with dentist
    * test: nicer formatting w/ dedent
- v3.0.2
- fix: singular selector composition check too strict

    `.one, .two { composes: red; }` was tripping it up, and that's totally
    valid!

- v3.0.1
- fix: over-complicate key creation, inodes are a lie (#243)

    Fixes #242
- 3.0.0
- feat: make multiple composition a crime (#241)

    Fixes #238

    This is a semver **major** change.
- chore: properly ignore test dir
- chore: :package: husky@0.13.1
- chore: match up with webpack output changes
- refactor: use webpack assets prop (#234)

    Not *technically* a breaking change.
- chore(package): update browserify to version 14.0.0 (#239) (greenkeeper[bot])

    https://greenkeeper.io/
- feat: use danger-js to validate pull requests (#237)

    * chore: setting up danger

    * test: require every new/changed file to be strict

    * chore: comments to trigger another build

    * test: break some stuff

    * chore: break on tests using .only

    * chore: nicer danger output

    * test: remove purposely-broken bits

- chore: allowing previewing of changes for next version
- chore(package): update rollup to version 0.41.1 (#236)

    Closes #235

    https://greenkeeper.io/
- v2.0.2
- docs: Update readme wording & add feature examples
- v2.0.1
- chore: Screwed that up, oops.
- docs: formatting tweak
- refactor: Change how webpack works to make it less weird

    I probably should have shipped webpack as 0.40.0 since this is a
    breaking change, but oh well. Time for v2.0.0!

- chore: update rollup-pluginutils to version 2.0.0 (#233) (greenkeeper[bot])

    https://greenkeeper.io/
- chore: update rollup to version 0.40.0 (#232) (greenkeeper[bot])

    https://greenkeeper.io/
- v1.0.1
- docs: updated description
- v1.0.0
- fix: generate parser before running tests
- feat: Webpack Plugin (#231)

    Fixes #34 
- test: switch to nyc for coverage
- test: tests for CLI implementation
- refactor: use meow for CLI instead

    Also actually return an error code when it all goes bad

- docs: PostCSS plugin docs
- feat: better postcss options support
- docs: fix bad regex
- feat: PostCSS Plugin (#230)

    Fixes #221 
- v0.29.1
- chore: update rollup to version 0.39.2 (#229)

    Closes #227

    https://greenkeeper.io/
- Differences between CSS Modules/modular-css

    Fixes #217
- Indentation
- Wording :pencil2:
- chore(package): update rollup to version 0.38.0 (#224) (greenkeeper[bot])

    https://greenkeeper.io/
- chore(package): update rollup to version 0.37.0 (#223) (Greenkeeper)

    https://greenkeeper.io/
- Ensure that nodes have sources
- Handle CLI errors
- Use bare function PostCSS plugins

    They're cleaner-looking and postcss doesn't care

- Give after/done hooks more data
- PostCSS doesn't like Object.create(null)
- Inline comment source creation
- Fix error reporting in initial walk of graph (#218)
- Update for features in 0.29.0
- v0.29.0
- :wave: bye node 5
- Arrow fns everywhere
- Emptying out objects w/ Object.create(null)
- Add :external(<selector> from <file>) support (#212)

    Fixes #211
- PEG.js parser, namespaces, cleanup (#210)

    Fixes #207 
- v0.28.3
- Properly scope multiple animations in a single declaration (#209)

    * Split apart classes & keyframe messages

    Fixes #208 by not just taking the first match but instead replacing all
    instances of matching keyframe rules.

    * General cleanup

    * Bah

- v0.28.2
- Global can overlap global, local can overlap local (#206)

    Fixes #205 
- v0.28.1
- Make default namer assignment more safe

    Also update a bunch of tests w/ arrow functions

- v0.28.0
- Replace local @value entries in @value rules (#204)
- Dedupe dependency graph using inodes (#203)

    Fixes #191 
- postcss@5.2.5 (#202) (Greenkeeper)
- Add node 6 as a test target
- Document all rollup options

    Fixes #201
- chore(package): update eslint to version 3.8.0 (#200) (Greenkeeper)
- Remove lodash.assign (#199)
- chore(package): update rollup to version 0.36.0 (#197) (Greenkeeper)

    https://greenkeeper.io/
- rollup@0.35.15 breaks build 🚨 (#196) (Greenkeeper)
- Add features link
- Update and rename css-modules.md to features.md
- Throw if a selector is used locally and globally (#194)
- v0.27.2
- Hack in rollup-watch support (#193)

    Fixes #158 
- Create LICENSE
- chore(package): update rollup to version 0.35.3 (#189) (Greenkeeper)

    https://greenkeeper.io/
- v0.27.1
- Re-work reference storing so globals are prefixed (#185)

    Fixes #184 by no longer accidentally overwriting the global w/ the local ref.

    Also!

    - Clean up some composition lib repetition
    - Verify the issue isn't in the composition lib
    - Add failing test for #184
- Fix example typo :pencil2:
- v0.27.0
- docs: break apart to improve clarity (#182)

    Everything in one giant readme was a bit of a nightmare.
- refactor: use cwd for .glob() (#181)

    Using the same cwd indicator for both `Processor` and `.glob()` reduces issues when dealing with junctions and makes it less likely to be misused

    BREAKING CHANGE:

    `dir` is no longer accepted as a property when invoking `.glob()` and will be ignored.
- refactor: Remove Promise polyfill (#180)

    node@4.x is where it's at, so drop support for a Promise polyfill to streamline the package.

    BREAKING CHANGE:

    Will no longer function on `node` less than `4.x` w/o some sort of global `Promise` polyfill being injected.
- v0.26.0
- Better handle errors within rollup (#178)
- chore(package): update mocha to version 3.0.0 (#177) (Greenkeeper)

    https://greenkeeper.io/
- chore(package): update shelljs to version 0.7.3 (#176) (Greenkeeper)

    https://greenkeeper.io/
- Add unicode test for processor (#175)

    Fixes #159
- v0.25.0
- Add CLI --json entry for output compositions
- v0.24.0
- postcss@5.1.0 (#157) (Greenkeeper)

    * chore(package): update postcss to version 5.1.0

    https://greenkeeper.io/

    * Speculative fix, not very happy w/ it though

    * More comment details

    * Update source maps for new behavior

    * ESlint cleanup :pencil2: :police_car:

    * Remove postcss-import in test

    It was complicating things. Use the world's simplest warning plugin
    instead.

- chore(package): update eslint-config-arenanet to version 3.0.0 (#173) (Greenkeeper)

    https://greenkeeper.io/
- CLI globbing (#174)
- 0.23.2
- Fix accidental test exclusion
- Use rollup ongenerate & onwrite hooks (#156)

    * Use ongenerate hook, add name

    * Sensible ongenerate/onwrite usage

    Thanks to rollup/rollup#773

- Clean up readme some :pencil2:
- 0.23.1
- 0.23.0
- Include dependencies in output (#154)

    Mostly so `rollup --watch` monitors the files correctly. Those deps will
    be tree-shaken out anyways since nothing else references them.

    Also adds a central place to create path-friendly relative paths,
    because browserify AND rollup doing it in code was stupid.
- chore(package): update eslint to version 3.0.0 (#153) (Greenkeeper)

    https://greenkeeper.io/
- chore(package): update rollup to version 0.33.0 (#152) (Greenkeeper)

    https://greenkeeper.io/
- v0.22.1
- postcss-url has vulnerable deps, but no easy fix
- Use publish-please for safety/sanity
- v0.22.0
- Add strict mode concept (#149)
- Use mocha's promise behavior
- Update rollup to version 0.32.0 🚀 (#147) (Greenkeeper)
- chore(package): update eslint to version 2.12.0 (#143) (Greenkeeper)

    https://greenkeeper.io/
- chore(package): update update-notifier to version 1.0.0 (#146) (Greenkeeper)

    https://greenkeeper.io/
- chore(package): update eslint to version 2.11.1 (#135) (Greenkeeper)

    https://greenkeeper.io/
- Silence ESLint warnings
- Restructure directories and general clean-up (#134)

    - Remove register hook, it was more dangerous than useful
    - Better test coverage
    - Standardize a bunch of access patterns
- v0.21.1
- Rework scoped selector plugin (#133)

    Now it runs through all pseudo selectors first, converting :global() to local w/o transforming the name. Then it goes through and transforms everyone else.

    Fixes #131
- Remove profiling artifacts
- Ignore profiling artifacts
- chore(package): update lodash.mapvalues to version 4.4.0 (#130) (Greenkeeper)
- VSCode config file
- v0.21.0
- v0.20.1
- Track sources for @value rules (#129)

    * Track sources for @value rules

    Mostly so sourcemaps can be even better.

    * More consistent source maps during tests

    So they stop failing on Travis, ideally.

- v0.20.0
- Fix rollup plugin arg to just be `map`
- :package: postcss@5.0.21

    Now that #128 un-fucked sourcemaps for us finally.

- Sourcemaps cleanup pass (#128)

    * Better support sourcemaps in rollup
    * Pin postcss@5.0.19 so sourcemaps don't break
    * Fix wonky source-map support in Processor
- chore(package): update update-notifier to version 0.7.0 (#127) (Greenkeeper)

    https://greenkeeper.io/
- Update postcss-selector-parser to version 2.0.0 🚀 (#126) (Greenkeeper)
- chore(package): update dependency-graph to version 0.5.0 (#123) (Greenkeeper)

    https://greenkeeper.io/
- Only write if a file was passed
- 4.3 => 4.4, Add 5
- chore(package): update shelljs to version 0.7.0 (#122) (Greenkeeper)

    https://greenkeeper.io/
- chore(package): update rollup to version 0.26.0 (#121) (Greenkeeper)
- v0.19.0
- Output in stable order (#120)
- v0.18.0
- API tweak, link fix
- Add compositions to .output() (#118)

    * Attach compositions property to results
    * Rollup takes advantage of result.compositions
    * Test for result.compositions
- v0.17.1
- v0.17.0
- Fixing readme anchors
- chore(package): update sink-transform to version 2.0.0 (#115) (Greenkeeper)
- Only export valid identifiers from rollup plugin (#116)

    * Fully jettison JSCS
    * Only export rules if they're valid JS identifiers
- chore(package): update eslint to version 2.8.0 (#112) (Greenkeeper)
- chore(package): update lodash.get to version 4.2.1 (#106) (Greenkeeper)
- Ditch JSCS, it and ESLint are merging someday
- Rollup exports individual declarations as well (#114)

    * Add test to verify tree-shaking
    * Added multiple exports to resulting JavaScript file
- Case-sensitivity oy vey
- Fix dumb CLI bug
- Move test around
- Use new _output module

    Also adds json output support to rollup plugin

- Remove trailing done reference
- Standardize generation of file -> output map
- More promises!
- Add a test to help verify something
- Take advantage of mocha promise understanding
- 0.16.0
- Fix symlinked files w/ browserify (#107)

    Symlinked files in the browserify transform aren't resolved, but within
    the dependency pipeline they have already been resolved to their target
    so they weren't matching up.

    **NOTE:** Unable to submit a symlink via git while I'm on windows, and I
    don't have a POSIX system handy. These tests are disabled for now
    :disappointed: :
- :package: lodash.mapvalues@4.3.0 (Greenkeeper)
- eslint@2.5.3
- chore(package): update eslint to version 2.5.0 (greenkeeperio-bot)

    http://greenkeeper.io/
- v0.15.0
- Ehhhhhhhh
- Make bithound happier
- Add complex value test (commas/quotes)

    Want to be sure that the use case in css-modules/css-modules#123 works
    as expected.

- Add require hook documentation
- Add require() hook to load css

    Runs the scoping plugin by itself, since that can run synchronously. Also processes files in the background and writes them out as it can using a processor intstance.

- v0.14.0
- Remove export stripping

    Rules that only compose something else are always stripped from the CSS,
    but are always left in the exports object. I don't see a compelling
    reason to remove them and it simplifies this code a lot.

    Fixes #98

- v0.13.0
- More clean-up
- Restructuring
- Update README.md
- Allow specifying CWD

    Switched processor.js over to mostly dealing w/ just absolute paths
    Still a bit of relativity in output generation, but it's minor and workable
    Updated browserify/rollup to work in this brave new world
    Also restructured tests a bunch

- Update travis to latest LTS
- chore(package): update lodash.filter to version 4.2.1 (greenkeeperio-bot)

    http://greenkeeper.io/
- v0.12.3
- Add rollup plugin docs
- First pass at rollup plugin
- Ignore .vscode folder
- A note on versioning
- Corrected browserify plugin usage

    Fixes #92
- v0.12.2
- Sort JSON output by file as well
- v0.12.1
- Sort output before generating so it's stable

    Otherwise we get lots of churn in the output, and there's no need for
    that.

- v0.12.0
- Rework lifecycle to before/after/done

    Expose `after` as an overridable option, by default it uses `postcss-url` to rebase file references.

    `before` - applied before files are processed
    `after` - applied after files are processed
    `done` - applied once files are combined

- :package: jscs@2.10.1
- chore(package): update eslint-config-arenanet to version 2.0.2 (greenkeeperio-bot)

    http://greenkeeper.io/
- chore(package): update lodash.uniq to version 4.2.0 (greenkeeperio-bot)

    http://greenkeeper.io/
- chore(package): update jscs to version 2.10.0 (greenkeeperio-bot)

    http://greenkeeper.io/
- Code cleanup for eslint@2.x
- Update ESLint config for eslint@2.x
- chore(package): update eslint to version 2.0.0 (greenkeeperio-bot)

    http://greenkeeper.io/
- chore(package): update shelljs to version 0.6.0 (greenkeeperio-bot)

    http://greenkeeper.io/
- Update README.md
- v0.11.2
- Tests and improving code coverage
- Spec fix
- v0.11.1
- Source map details
- Simple source maps test :school:
- ESlint fix :police_car: :pencil:
- CLI should default to inline sourcemaps
- Ensure that options are always merged in
- v0.11.0
- .css() :arrow_right: .output()

    Along with a change in response, instead of css it's now a postcss
    result/lazyresult.

- Process afters against the complete output

    Means we no longer return a simple string, bleh.

- Update README.md
- Document missing portions of the API :pencil:
- v0.10.6
- v0.10.5
- Apparently NPM requires the shebang
- v0.10.4
- Lint cleanup
- Kick CLI into the brave new world of promises
- Actually declare that we have a bin file
- v0.10.3
- v0.10.2
- Ensure that JSON output is strings

    Fixes #68

    Also switched to more-complete paths instead of the weird basedir
    shorthand.

- Let's try deploying from travis

    WHAT COULD POSSIBLY GO WRONG?

- v0.10.1
- Don't explode on unknown files in remove() calls

    Fixes #66

- Update README.md
- v0.10.0
- Remove unused var :police_car: :pencil:
- Only remove if selector isn't used again

    Fixes #56

- chore(package): update postcss-url to version 5.1.0 (greenkeeperio-bot)

    http://greenkeeper.io/
- Remove global transform :globe_with_meridians:
- emit file events & push rows into streams

    to get watchify/factor-bundle to work correctly both are required.

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

    http://greenkeeper.io/
- 0.9.0
- :package: lodash@4.0.1
- Support postcss async plugins

    Had to entirely refactor `processor.js`/`browserify.js` & their tests to use Promises all over the place, that was fun.

    Includes promiscuous as a back-compat shim if necessary (node 0.10.x support)

    Also fixes incorrect export name & updates API usage for the readme

- chore(package): update lodash.uniq to version 4.0.1 (greenkeeperio-bot)

    http://greenkeeper.io/
- chore(package): update lodash.difference to version 4.0.1 (greenkeeperio-bot)

    http://greenkeeper.io/
- :package: istanbul@0.4.2 watchify@3.7.0
- chore(package): update browserify to version 13.0.0 (greenkeeperio-bot)

    http://greenkeeper.io/
- v0.8.0
- Run linter/tests before cutting a new version
- Add before/after for running postcss plugins
- v0.7.5
- Run all the tests, yo.
- postcss@5.0.14 jscs@2.8.0 :package:
- Fix + tests for #35

    Need to clone parsed nodes before rewriting relative URLs, otherwise
    they can be processed multiple times. Probably a bit slower.

- keyword gunk
- v0.7.4
- Hold onto bundler ref for nicer errors :feelsgood:

    - Processor.remove removes deps from graph
    - Improved composes invalid ref error message
    - Simplify test specimen JS to bare essentials
    - Test no commonalities with factor-bundle

- postcss@5.0.13 postcss-value-parser@3.2.3 :package:
- v0.7.3
- Add processor.remove & use in browserify

    So that whenever watchify sees an update we can purge cache entries w/o
    having to re-create everything on every call to `browserify.bundle()`.

    Fixes #30

- Test for watchify caching issue
- Fix watchify caching issue

    By creating a new processor object every time bundle is called. This may
    be inefficient, but it is at least more correct!

- v0.7.2
- Use factor-bundle bundling logic

    - This fixes some bugs in my logic and also really simplifies it!
    - I also changed the exports to be nicely spaced because why not.
    - Needed to modify some tests to account for this, because it's *more*
    correct now than it was.
    - Converted the rest of the tests to use the `bundle()` helper because
    it's way better.

- v0.7.1
- Fix logic determining which files to include
- Add some test helpers
- Clean up output dir before running browserify tests
- v0.7.0
- :pencil2: Exports are now space-separated strings
- Change exports to be space-separated strings

    Also updated tests so they, you know, pass.

- v0.6.1
- Break apart value processing

    Now resolving local @values earlier in the process so they are more useful.
    Also some removal of repeated processing of files that was doing strange things.

- v0.6.0
- chore(package): update update-notifier to version 0.6.0 (greenkeeperio-bot)

    http://greenkeeper.io/
- Can't forget the "mc" prefix to keep things valid
- Finish fixing up tests
- Updating hashes
- Use unique-slug instead of hasha
- v0.5.1
- Prefix hash with "mc" so it's always valid

    - Because a CSS class can't start with a number, lol.
    - Update tests for new hash format

- Correct browserify usage :boom:
- :construction:
- :construction_worker:
- v0.5.0
- Use postcss-value-parser instead of regexes

    Switched to actually parsing values using `postcss-value-parser` because it's safer. It also led to some consolidation of code between `composes` and `@value` rules which is a nice side-benefit.

- Use sink-transform instead of manually handling
- v0.4.1
- Two graphs was dumb.

    So use one instead! Also abstract out the parse function because we're
    already using function.bind anyways.

- v0.4.0
- Actual tests for multiple composes statements

    - decl.prev() seems a bit wonky, may need to rethink that check. Seems
    to work for now though.
    - Added some tests to make sure that it works with global(...)
    - Minor optimization, only call unique once per selector we're
    outputting instead of every single time they're composed.

- Add support for composes: global(selector);

    Also simplified composition tests by making a message helper to get
    things a bit more DRY

- @keyframes scoping/rewriting support

    Also broke apart a bunch of functionality so it's smaller/more testable.

- v0.3.0
- Browserify transform can write out empty files

    But only if you ask nicely, by passing `empty : true`.

    Fixes #2

    Also contains some small cleanup for `src/processor.js` that doesn't
    change anything.

- Processor.css() takes an object

    If it has a `to` property it's is passed to `postcss-url` and will
    rewrite relative URLs to update them based on where they are being
    written to. This is used by the browserify transform to ensure that the
    files are updated for their new locations.

    Passing an array of files is now expected to be on a `files` property.

    Fixes #1

- v0.2.0
- Add some tests for processor passing scoping args
- Passing prefix/namer through all the layers

    & add tests!

- Plumbing through naming function to postcss
- Fix up :global() support and add tests
- Match css-modules behavior on scoping
- Fixed line endings
- Fixed eol attribute
- Update README.md
- v0.1.0
- Add factor-bundle documentation :pencil2:
- Support factor-bundle plugin

    Now able to map `factor-bundle` bundles to CSS dependencies, dedupe, and extract common dependencies amongst the bundles (and common files).

- Show master branch build status
- Valid version for publishing
- Local composition
- :pencil2:
- Support adding multiple files

    ... by making the processor object instantiable. Also improves tests quite a bit and gets coverage to 100%. Also lints w/ builds.

- \n, not \r\n
- Simplify default css file name
- Add update-notifier as an experiment
- Better JSON output name
- Usage examples and other readme tweaks
- Flesh out some missing package.json fields
- Badges
- Disable 5.0 builds until mock-fs is updated

    See https://github.com/tschaub/mock-fs/issues/67

- Add travis config
- Add browserify transform

    - Rewrite tests to use mock-fs
    - Improve test coverage
    - Slight default exports tweaks

- Export the import API as `process()`
- Add an actual (very basic) CLI
- DRY this up a bit
- Update package.json
- Update README.md
- Create README.md
- Code coverage & sanity
- Code coverage and ensure that IDs work
- Extract function into upper scope

    No real good reason why, seems a bit cleaner?

- Rework scoping to expressly handle invalid selectors
- More tests for full importing path

    To help test error states & nested value hierarchies

- Remove concept of "root", it's redundant
- Test import response w/ a hierarchy
- Correct composition hierarchy output

    Had to separate input/output objects and track them a little
    differently.

- Updated dep
- Use node-style resolve, more tests
- Move node_modules test specimen
- Missing test specimen
- Early-out if no @value rules.
- Test specimen
- Testing imports somewhat
- Composition cleanup & imports support
- More useful export, node-style resolution
- Value support for reading from imports

    Tries to protect against bad usage, we shall see...

- Basic imports support seems to be working

    Still missing some things, like node_modules support :disappointed:

- Remove imports plugin

    Needs to recursively build dependency graph & parse other files, I don't
    think that can be done as a postcss plugin...

- Renaming tests for plugins
- Better handling of invalid value definitions
- Start fumbling my way through imports

    Nowhere near working yet though.

- Extract regexp
- Better output, starting on import plugin
- Simple CLI runner
- Value implementation & tests!
- Run all tests
- Only use mocha when we care
- Composition working

    Now w/ more accurate lookups thanks to selector parsing!

- Test cleanup
- require ordering
- Fix linting via editors
- ESLint
- ESLint cleanup
- Scoping rules seem to work!
- Starting work on refactoring into multiple plugins
- Way too simple support for @value

    Like... way WAY too simple.

- More granular test files
- Basic class rewriting & composition working

    + tests!

- Trying out some ideas
- :confetti_ball: Added .gitattributes & .gitignore files
