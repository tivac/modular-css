### glob API

A JS API for using glob patterns with [`modular-css`](https://github.com/tivac/modular-css).

#### glob install

`$ npm i @modular-css/glob`

#### glob usage

```js
const glob = require("@modular-css/glob");

    // returns a filled-out Processor instance you can use
const processor = await glob({
    search : [
        "**/*.css"
    ]
})
```

#### glob options

###### `search`

Array of glob patterns to pass to [`globule`](https://www.npmjs.com/package/globule) for searching.

##### Shared Options

All other options are passed to the underlying `Processor` instance, see the [Processor Options](#processor-options).
