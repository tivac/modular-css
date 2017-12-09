modular-css-svelte  [![NPM Version](https://img.shields.io/npm/v/modular-css-svelte.svg)](https://www.npmjs.com/package/modular-css-svelte) [![NPM License](https://img.shields.io/npm/l/modular-css-svelte.svg)](https://www.npmjs.com/package/modular-css-svelte) [![NPM Downloads](https://img.shields.io/npm/dm/modular-css-svelte.svg)](https://www.npmjs.com/package/modular-css-svelte)
===========

<p align="center">
    <a href="https://gitter.im/modular-css/modular-css"><img src="https://img.shields.io/gitter/room/modular-css/modular-css.svg" alt="Gitter" /></a>
</p>

Svelte preprocessor support for [`modular-css`](https://github.com/tivac/modular-css). Integrate `modular-css` with `svelte` at compile-time, for smaller bundles and even faster runtime!

## Install

`$ npm i modular-css-svelte`

## Usage

### `svelte.preprocess()`

```js
const filename = "./Component.html";

const { processor, preprocess } = require("modular-css-svelte)({
    css : "./dist/bundle.css"
});

const processed = await svelte.preprocess(
    fs.readFileSync(filename, "utf8"),
    Object.assign({}, preprocess, { filename })
);

const result = processor.output();

fs.writeFileSync("./dist/bundle.css", result.css);
```

### `rollup-plugin-svelte`

#### API

```js
const rollup = require("rollup").rollup;

const { preprocess, plugin } = require("modular-css-svelte/rollup")({
    css : "./dist/bundle.css"
});

const bundle = await rollup({
    input   : "./Component.html",
    plugins : [
        require("rollup-plugin-svelte")({
            preprocess : preprocess
        }),
        plugin
    ]
});

// bundle.write will also write out the CSS to the path specified in the `css` arg
bundle.write({
    format : "es",
    file   : "./dist/bundle.js"
});
```

#### `rollup.config.js`

```js
const { preprocess, plugin } = require("modular-css-svelte/rollup")({
    css : "./dist/bundle.css"
});

module.exports = {
    input   : "./Component.html",
    output  : {
        format : "es",
        file   : "./dist/bundle.js"
    },
    plugins : [
        require("rollup-plugin-svelte")({
            preprocess : preprocess
        }),
        plugin
    ]
};
```

## Options

All options are passed to the underlying `Processor` instance, see [Options](https://github.com/tivac/modular-css/blob/master/docs/api.md#processor-options).

