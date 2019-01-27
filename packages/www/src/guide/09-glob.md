## glob

A JS API for using glob patterns with [`modular-css`](https://github.com/tivac/modular-css).

- [Install](#install)
- [Usage](#usage)
- [Options](#options)

### Install

`$ npm i @modular-css/glob`

### Usage

```js
var glob = require("@modular-css/glob");

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

`glob()` accepts all of the same options as laid out in the [Processor Options](#processor-options).

##### `search`

Array of glob patterns to pass to [`globule`](https://www.npmjs.com/package/globule) for searching.
