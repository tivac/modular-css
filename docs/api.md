# API

## Processor

Instantiate a new `Processor` instance, call it's `.file(<path>)` or `.string(<name>, <contents>)` methods, and then use the returned Promise to get access to the results/output.

```js
var Processor = require("modular-css"),
    processor = new Processor({
        // See "API Options" for valid options to pass to the Processor constructor
    });

// Add entries, either from disk using .file() or as strings with .string()
Promise.all([
    processor.file("./entry.css").then(function(result) {
        // result now contains
        //  .exports - Scoped selector mappings
        //  .files - metadata about the file hierarchy
    }),
    processor.string("./fake-file.css", ".class { color: red; }")
])
.then(function() {
    // Once all files are added, use .output() to get at the rewritten CSS
    return processor.output();
})
.then(function(result) {
    // Output CSS lives on the .css property
    result.css;
    
    // Source map (if requested) lives on the .map property
    result.map;
});
```

### Processor Options

#### `before`

Specify an array of PostCSS plugins to be run against each file before it is processed.

```js
new Processor({
    before : [ require("postcss-import") ]
});
```
#### `after`

Specify an array of PostCSS plugins to be run after files are processed, but before they are combined. Plugin will be passed a `to` and `from` option.

**By default** [`postcss-url`](https://www.npmjs.com/package/postcss-url) is used in `after` mode.

```js
new Processor({
    after : [ require("postcss-someplugin") ]
});
```

#### `done`

Specify an array of PostCSS plugins to be run against the complete combined CSS.

```js
new Processor({
    done : [ require("cssnano")()]
});
```

#### `map`

Enable source map generation. Can also be passed to `.output()`.

**Default**: `false`

```js
new Processor({
    map : true
});
```

#### `cwd`

Specify the current working directory for this Processor instance, used when resolving `composes`/`@value` rules that reference other files.

**Default**: `process.cwd()`

```js
new Processor({
    cwd : path.join(process.cwd(), "/sub/dir")
})
```

#### `namer`

Specify a function (that takes `filename` & `selector` as arguments to produce scoped selectors.

**Default**: Function that returns `"mc" + unique-slug(<file>) + "_" + selector`

```js
new Processor({
    namer : function(file, selector) {
        return file.replace(/[:\/\\ .]/g, "") + "_" + selector;
    }
});
```

## Globbing

If you don't care about the dependency tree from your code you can also use the globbing API to find files to process.

```js
var glob = require("modular-css/glob");

glob({
    search : [
        "**/*.css"
    ]
})
.then(function(processor) {
    // returns a filled-out Processor instance you can use
})
```

`glob()` accepts all of the same options as a [`Processor` instance](#processor-options) with the addition of the [`search`](#search) property.

### Glob Options

#### `search`

Array of glob patterns to pass to [`globule`](https://www.npmjs.com/package/globule) for searching.
