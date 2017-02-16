# Changes

## 3.1.0

- fix: smarter value matching (#247)

## 3.0.2

- fix: singular selector composition check was too strict, now it properly
       supports CSS like `.one, .two { composes: red; }`

## 3.0.1

- fix: Solve a mysterious pruning issue where files were being excluded. (#243)

## 3.0.0

- feat: make multiple composition a crime (#241)
- refactor: use webpack assets prop (#234)

## 2.0.2

- docs: Update readme wording & add feature examples

## 2.0.1

- docs: formatting tweak

## 2.0.0

- refactor: Change how webpack works to make it less weird
- chore: update rollup-pluginutils to version 2.0.0 (#233) (greenkeeper[bot])
- chore: update rollup to version 0.40.0 (#232) (greenkeeper[bot])

## 1.0.1

- docs: updated description

## 1.0.0

- feat: Webpack Plugin (#231)
- feat: PostCSS Plugin (#230)
- feat: CLI returns an error code when it all goes bad

