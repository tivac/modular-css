# @modular-css/www

Code + content that becomes m-css.com

## Building

From the root, `npm run www:build` will build a static copy of the site to the `packages/www/dist` folder.

`npm run www:start` will start a rollup watcher as well as a server.

## Hosting

Site is hosted by netlify.com, auto-builds and deploys from the `master` branch. Should keep it up to date with future releases.

## Notes

1. `postcss` is bundled by using webpack within a rollup plugin, because rollup doesn't handle all the circular references in postcss very well.
2. Rollup is being used to generate static sites in a rather circuitous way, by compiling svelte components to common js w/ SSR enabled & `require()`ing them.
3. Uses Shimport to load REPL JS as ESM

## TODO

- [ ] See if the webpack-built `postcss` can be trimmed down at all by excluding packages rollup can bundle fine
- [ ] Allow for giving new REPL tabs a name
- [ ] Figure out how to get REPL build to not output CSS
