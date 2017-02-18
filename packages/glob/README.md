modular-css-glob [![NPM Version](https://img.shields.io/npm/v/modular-css-glob.svg)](https://www.npmjs.com/package/modular-css-glob) [![Build Status](https://img.shields.io/travis/tivac/modular-css/master.svg)](https://travis-ci.org/tivac/modular-css)
===========
<p align="center">
    <a href="https://www.npmjs.com/package/modular-css-glob" alt="NPM License"><img src="https://img.shields.io/npm/l/modular-css-glob.svg" /></a>
    <a href="https://www.npmjs.com/package/modular-css-glob" alt="NPM Downloads"><img src="https://img.shields.io/npm/dm/modular-css-glob.svg" /></a>
</p>

A JS API for using `modular-css` via glob patterns.

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
