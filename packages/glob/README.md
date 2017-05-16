modular-css-glob [![NPM Version](https://img.shields.io/npm/v/modular-css-glob.svg)](https://www.npmjs.com/package/modular-css-glob) [![NPM License](https://img.shields.io/npm/l/modular-css-glob.svg)](https://www.npmjs.com/package/modular-css-glob) [![NPM Downloads](https://img.shields.io/npm/dm/modular-css-glob.svg)](https://www.npmjs.com/package/modular-css-glob)
===========

<p align="center">
    <a href="https://gitter.im/modular-css/modular-css"><img src="https://img.shields.io/gitter/room/modular-css/modular-css.svg" alt="Gitter" /></a>
</p>

A JS API for using glob patterns with [`modular-css`](https://github.com/tivac/modular-css).

## Install

`$ npm i modular-css-glob`

## Usage

```js
var glob = require("modular-css-glob");

glob({
    search : [
        "**/*.css"
    ]
})
.then((processor) => {
    // returns a filled-out Processor instance you can use
})
```

### Options

`glob()` accepts all of the same options as a [`Processor` instance](https://github.com/tivac/modular-css/blob/master/docs/api.md#processor-options).

#### `search`

Array of glob patterns to pass to [`globule`](https://www.npmjs.com/package/globule) for searching.
