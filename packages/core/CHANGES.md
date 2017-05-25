# Changes

## 5.1.5

- feat: Apply true-case-path to resolved paths (#322)
- refactor: trim down relative

## 5.1.4

- refactor: Rework .remove(), again (#307)

## 5.1.2
 
- refactor: no recursion during .remove() (#306)

## 5.1.1

- fix: Recursive remove (#301) (Bogdan Chadkin)

## 5.0.0

- refactor: Use absolute paths internally (#300)

## 4.3.0

- feat: exportGlobals option in core (#287) (Bogdan Chadkin)

## 4.2.2
 
- fix: support multiple :global(...) in a selector (#281)

## 4.2.1

- fix: allow comments before composes in a rule (#274)

## 4.2.0

- fix: More flexible postcss support for options (#271)

## 4.1.2

- fix: pseudos other than :external in a selector are ok (#263)

## 4.1.0

- feat: namer can be a string, will be passed to require()

## 4.0.6

- fix: early-out from keyframe renaming if no work to do (#259)

## 4.0.1

- fix: clean up some stale references
- fix: clarify bin name for modular-css-cli

## 4.0.0

- refactor: convert to separate packages using lerna (#253)

## 3.2.0

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
- refactor: use webpack assets prop (#234)

## 2.0.2

- docs: Update readme wording & add feature examples

## 2.0.1

- refactor: Change how webpack works to make it less weird

## 1.0.1

- docs: updated description

## 1.0.0

- feat: Webpack Plugin (#231)
- feat: better postcss options support
- feat: PostCSS Plugin (#230)

## 0.29.1

- Handle CLI errors
- Give after/done hooks more data
- Inline comment source creation
- Fix error reporting in initial walk of graph (#218)

## 0.29.0

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
- Throw if a selector is used locally and globally (#194)

## 0.27.2

- Hack in rollup-watch support (#193)

## 0.27.1

- Re-work reference storing so globals are prefixed (#185)

## 0.27.0

- refactor: use cwd for .glob() (#181)
- refactor: Remove Promise polyfill (#180)

## 0.26.0

- Better handle errors within rollup (#178)

## 0.25.0

- Add CLI --json entry for output compositions

## 0.24.0

- CLI globbing (#174)

## 0.23.2

- Use rollup ongenerate & onwrite hooks (#156)

## 0.23.0

- Include dependencies in output (#154)

## 0.22.0

- Add strict mode concept (#149)
- Remove register hook, it was more dangerous than useful

## 0.21.1

- Rework scoped selector plugin (#133)

## 0.20.1

- Track sources for @value rules (#129)

## 0.20.0

- Fix rollup plugin arg to just be `map`
- Sourcemaps cleanup pass (#128)
- Only write if a file was passed

## 0.19.0

- Output in stable order (#120)

## 0.18.0

- Add compositions to .output() (#118)

## 0.17.0

- Only export valid identifiers from rollup plugin (#116)
- Rollup exports individual declarations as well (#114)
- Fix dumb CLI bug
- Standardize generation of file -> output map

## 0.16.0

- Fix symlinked files w/ browserify (#107)

## 0.15.0

- Add require() hook to load css

## 0.14.0

- Remove export stripping (#98)

## 0.13.0

- Allow specifying CWD

## 0.12.3

- First pass at rollup plugin
- Corrected browserify plugin usage (#92)

## 0.12.2

- Sort JSON output by file as well

## 0.12.1

- Sort output before generating so it's stable

## 0.12.0

- Rework lifecycle to before/after/done

## 0.11.2

- Spec fix

## 0.11.1

- Source map details
- CLI should default to inline sourcemaps

## 0.11.0

- .css() :arrow_right: .output()
- Process afters against the complete output

## 0.10.5

- Apparently NPM requires the shebang

## 0.10.4

- Kick CLI into the brave new world of promises

## 0.10.2

- Ensure that JSON output is strings (#68)

## 0.10.1

- Don't explode on unknown files in remove() calls

## 0.10.0

- Only remove if selector isn't used again
- Remove global transform :globe_with_meridians:
- emit file events & push rows into streams
- Better after() usage
- Fix extension naming when no extension exists
- Centralize file-reading in Processor :file_folder:
- Easily creating readable streams
- Browserify creates output dirs now

## 0.9.0

- Support postcss async plugins

## 0.8.0

- Add before/after for running postcss plugins

## 0.7.5

- Fix + tests for #35

## 0.7.4

- Hold onto bundler ref for nicer errors :feelsgood:

## 0.7.3

- Add processor.remove & use in browserify
- Fix watchify caching issue

## 0.7.2

- Use factor-bundle bundling logic

## 0.7.1

- Fix logic determining which files to include

## 0.7.0

- Change exports to be space-separated strings

## 0.6.1

- Break apart value processing

## 0.6.0

- Can't forget the "mc" prefix to keep things valid
- Updating hashes
- Use unique-slug instead of hasha

## 0.5.1

- Prefix hash with "mc" so it's always valid
- Correct browserify usage :boom:

## 0.5.0

- Use postcss-value-parser instead of regexes

## 0.4.1

- Two graphs was dumb.

## 0.4.0

- Add support for composes: global(selector);
- @keyframes scoping/rewriting support

## 0.3.0

- Browserify transform can write out empty files
- Processor.css() takes an object

## 0.2.0

- Fix up :global() support and add tests
- Match css-modules behavior on scoping

## 0.1.0

- Support factor-bundle plugin
- Local composition
- Support adding multiple files
- Simplify default css file name
- Better JSON output name
- Add browserify transform
- Export the import API as `process()`
- Add an actual (very basic) CLI
- Rework scoping to expressly handle invalid selectors
- Remove concept of "root", it's redundant
- Correct composition hierarchy output
- Composition cleanup & imports support
- More useful export, node-style resolution
- Value support for reading from imports
- Basic imports support seems to be working
- Better handling of invalid value definitions
