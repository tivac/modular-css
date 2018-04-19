modular-css-rollup  [![NPM Version](https://img.shields.io/npm/v/modular-css-rollup.svg)](https://www.npmjs.com/package/modular-css-rollup) [![NPM License](https://img.shields.io/npm/l/modular-css-rollup.svg)](https://www.npmjs.com/package/modular-css-rollup) [![NPM Downloads](https://img.shields.io/npm/dm/modular-css-rollup.svg)](https://www.npmjs.com/package/modular-css-rollup)
===========

<p align="center">
    <a href="https://gitter.im/modular-css/modular-css"><img src="https://img.shields.io/gitter/room/modular-css/modular-css.svg" alt="Gitter" /></a>
</p>

Rollup support for [`modular-css`](https://github.com/tivac/modular-css).

## Install

`$ npm i modular-css-rollup`

## Usage

### API

```js
rollup({
    input   : "./index.js",
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
    input   : "./index.js",
    output  : {
        dest    : "./gen/bundle.js",
        format  : "umd"
    },
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

### `namedExports`

By default this plugin will create both a default export and named `export`s for each class in a CSS file. You can disable this by setting `namedExports` to `false`.

### Shared Options

All other options are passed to the underlying `Processor` instance, see [Options](https://github.com/tivac/modular-css/blob/master/docs/api.md#options).

