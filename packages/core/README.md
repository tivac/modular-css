modular-css-core  [![NPM Version](https://img.shields.io/npm/v/modular-css-core.svg)](https://www.npmjs.com/package/modular-css-core) [![NPM License](https://img.shields.io/npm/l/modular-css-core.svg)](https://www.npmjs.com/package/modular-css-core) [![NPM Downloads](https://img.shields.io/npm/dm/modular-css-core.svg)](https://www.npmjs.com/package/modular-css-core)
===========

<p align="center">
    <a href="https://gitter.im/modular-css/modular-css"><img src="https://img.shields.io/gitter/room/modular-css/modular-css.svg" alt="Gitter" /></a>
</p>

The core functionality of [`modular-css`](https://npmjs.com/modular-css) exposed as a JS API.

## Install

`$ npm i modular-css-core`

## Usage

Instantiate a new `Processor` instance, call it's `.file(<path>)` or `.string(<name>, <contents>)` methods, and then use the returned Promise to get access to the results/output.

```js
var Processor = require("modular-css-core"),
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

#### `resolvers`

If you want to provide your own file resolution logic you can pass an array of resolver functions. Each resolver function receives three arguments:

- `src`, the file that included `file`
- `file, the file path being included by `src`
- `resolve`, the default resolver function

Resolver functions should either return an absolute path or a falsey value. They must also be synchronous.

**Default**: See [/src/lib/resolve.js](/src/lib/resolve.js) for the default implementation.

```js
new Processor({
    resolvers : [
        (src, file, resolve) => ...,
        require("modular-css-resolvepaths")(
            "./some/other/path"
        )
    ]
})
```

#### `exportGlobals`

Enable exporting `:global` identifiers.

**Default**: true

```js
new Processor({
    exportDefaults: false
})
```

```css
/* exportGlobals: true */
.a {}
:global(.b) {}

/* Outputs
{
    "a" : "mc12345_a",
    "b" : "b"
}
*/

/* exportGlobals: false */
.a {}
:global(.b) {}

/* Outputs
{
    "a" : "mc12345_a"
}
*/
```
