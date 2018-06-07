# modular-css-rollup  [![NPM Version](https://img.shields.io/npm/v/modular-css-rollup.svg)](https://www.npmjs.com/package/modular-css-rollup) [![NPM License](https://img.shields.io/npm/l/modular-css-rollup.svg)](https://www.npmjs.com/package/modular-css-rollup) [![NPM Downloads](https://img.shields.io/npm/dm/modular-css-rollup.svg)](https://www.npmjs.com/package/modular-css-rollup)

<p align="center">
    <a href="https://gitter.im/modular-css/modular-css"><img src="https://img.shields.io/gitter/room/modular-css/modular-css.svg" alt="Gitter" /></a>
</p>

Rollup support for [`modular-css`](https://github.com/tivac/modular-css).

## Install

`$ npm i modular-css-rollup`

## Usage

⚠️ As of `modular-css-rollup@11` this plugin will only work with `rollup@0.60.0` or higher due to plugin API changes ⚠️

### API

```js
const bundle = await rollup({
    input   : "./index.js",
    plugins : [
        require("modular-css-rollup")()
    ]
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
        css()
    ]
};
```

## Options

### `common`

File name to use in case there are any CSS dependencies that appear in multiple bundles.

### `include`/`exclude`

A minimatch pattern, or an array of minimatch patterns, relative to `process.cwd()`. `include` defaults to `**/*.css`.

### `json`

Boolean to determine if JSON files should be output at the end of compilation. Defaults to `false`.

### `map`

Boolean to determine if inline source maps should be included. Defaults to `true`.

To force the creation of external source maps set the value to `{ inline : false }`.

### `namedExports`

By default this plugin will create both a default export and named `export`s for each class in a CSS file. You can disable this by setting `namedExports` to `false`.

### Shared Options

All other options are passed to the underlying `Processor` instance, see [Options](https://github.com/tivac/modular-css/blob/master/docs/api.md#options).
