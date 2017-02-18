modular-css-rollup [![NPM Version](https://img.shields.io/npm/v/modular-css-rollup.svg)](https://www.npmjs.com/package/modular-css-rollup) [![Build Status](https://img.shields.io/travis/tivac/modular-css/master.svg)](https://travis-ci.org/tivac/modular-css)
===========
<p align="center">
    <a href="https://www.npmjs.com/package/modular-css-rollup" alt="NPM License"><img src="https://img.shields.io/npm/l/modular-css-rollup.svg" /></a>
    <a href="https://www.npmjs.com/package/modular-css-rollup" alt="NPM Downloads"><img src="https://img.shields.io/npm/dm/modular-css-rollup.svg" /></a>
    <a href="https://david-dm.org/tivac/modular-css-rollup" alt="Dependency Status"><img src="https://img.shields.io/david/tivac/modular-css-rollup.svg" /></a>
    <a href="https://david-dm.org/tivac/modular-css-rollup#info=devDependencies" alt="devDependency Status"><img src="https://img.shields.io/david/dev/tivac/modular-css-rollup.svg" /></a>
</p>

`modular-css-rollup` provides a rollup build plugin you can use to transform imported `.css` files into lookup objects.

## Install

`$ npm i modular-css`

## Usage

### API

```js
rollup({
    entry   : "./index.js",
    plugins : [
        require("modular-css-rollup")({
            css : "./gen/index.css"
        })
    ]
}).then(function(bundle) {
    ...
});
```

### Config file

```js
import css from "modular-css-rollup";

export default {
    entry   : "./index.js",
    dest    : "./gen/bundle.js",
    format  : "umd",
    plugins : [
        css({
            css : "./gen/index.css"
        })
    ]
};
```

## Options

### `ext`

Extension to match on. Defaults to `.css`. Can be used in place of `include`/`exclude`.

### `include`/`exclude`

A minimatch pattern, or an array of minimatch patterns, relative to `process.cwd()`. Can be used in place of `ext`.

### `css`

Location to write the generated CSS file to.

### `json`

Location to write out the JSON mapping file for use in server rendering.

### Shared Options

All other options are passed to the underlying `Processor` instance, see [Options](https://github.com/tivac/modular-css/blob/master/docs/api.md#processor-options).

