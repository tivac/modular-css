# Glob

If you don't care about the dependency tree from your code you can also use the globbing API to find files to process.

## Usage

```js
var glob = require("modular-css-glob");

glob({
    search : [
        "**/*.css"
    ]
})
.then(function(processor) {
    // returns a filled-out Processor instance you can use
})
```

## Options

`glob()` accepts all of the same options as a [`Processor` instance](api.md#processor-options) with the addition of the [`search`](#search) property.

### `search`

Array of glob patterns to pass to [`globule`](https://www.npmjs.com/package/globule) for searching.
