# `Processor` API

- [Usage](#usage)
- [Options](#options)
- [Properties](#properties)
- [API](#api)

## Usage

Instantiate a new `Processor` instance, call it's `.file(<path>)` or `.string(<name>, <contents>)` methods, and then use the returned Promise to get access to the results/output.

```js
var Processor = require("modular-css"),
    processor = new Processor({
        // See "API Options" for valid options to pass to the Processor constructor
    });

// Add entries, either from disk using .file() or as strings with .string()
Promise.all([
    processor.file("./entry.css").then((result) => {
        // result contains
        //  id      : Absolute path of the file that was added
        //  file    : Absolute path of hte file that was added
        //  files   : metadata about the file hierarchy,
        //  details : metadata aboutthe file that was added,
        //  exports : Scoped selector mappings for the file that was added
    }),
    processor.string("./fake-file.css", ".class { color: red; }")
])
.then(() => {
    // Once all files are added, use .output() to get at the rewritten CSS
    return processor.output();
})
.then((result) => {
    // result.css : Combined CSS output
    // result.map : Source map data if enabled
    // result.compositions - All files and their composed dependencies
});
```

## Options

### `before`

Specify an array of PostCSS plugins to be run against each file before it is processed.

```js
new Processor({
    before : [ require("postcss-import") ]
});
```

### `after`

Specify an array of PostCSS plugins to be run after files are processed, but before they are combined. Plugin will be passed a `to` and `from` option.

**By default** [`postcss-url`](https://www.npmjs.com/package/postcss-url) is used in `after` mode.

```js
new Processor({
    after : [ require("postcss-someplugin") ]
});
```

### `done`

Specify an array of PostCSS plugins to be run against the complete combined CSS.

```js
new Processor({
    done : [ require("cssnano")()]
});
```

### `map`

Enable source map generation. Can also be passed to `.output()`.

**Default**: `false`

```js
// Inline source map
new Processor({
    map : true
});

// External source map
new Processor({
    map : {
        inline : fase
    }
});
```

### `cwd`

Specify the current working directory for this Processor instance, used when resolving `composes`/`@value` rules that reference other files.

**Default**: `process.cwd()`

```js
new Processor({
    cwd : path.join(process.cwd(), "/sub/dir")
})
```

### `namer`

Specify a function (that takes `filename` & `selector` as arguments) to produce scoped selectors.

Can also pass a string that will be `require()`'d and executed, it should return the namer function.

**Default**: Function that returns `"mc" + unique-slug(<file>) + "_" + selector`

```js
new Processor({
    namer : function(file, selector) {
        return file.replace(/[:\/\\ .]/g, "") + "_" + selector;
    }
});

// or

new Processor({
    namer : "modular-css-namer"
});
```

### `resolvers`

If you want to provide your own file resolution logic you can pass an array of resolver functions. Each resolver function receives three arguments:

- `src`, the file that included `file`
- `file`, the file path being included by `src`
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

### `exportGlobals`

By default identifiers wrapped in `:global(...)` are exported for ease of referencing via JS. By setting `exportGlobals` to `false` that behavior can be disabled. Mostly useful to avoid warnings when global CSS properties are not valid JS identifiers.

```js
new Processor({
    exportGlobals : false
});
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

## Properties

### `.files`

Returns an object keyed by absolute file paths of all known files in the `Processor` instance.

### `.options`

Returns the options object passed to the `Processor` augmented with the defaults.

## APIs

### `.string(file, css)`

Returns a promise. Add `file` to the `Processor` instance with `css` contents.

### `.file(file)`

Returns a promise. Add `file` to the `Processor` instance, reads contents from disk using `fs`.

### `.output([files])`

Returns a promise. Finalize processing of all added CSS and create combined CSS output file. Optionally allows for combining a subset of the loaded files by passing a single file or array of files.

**WARNING**: Calling `.output()` before any preceeding `.file(...)`/`.string(...)` calls have resolved their returned promises will return a rejected promise. See [usage](#usage) for an example of correct usage.

### `.remove([files])`

Remove files from the `Processor` instance. Accepts a single file or array of files.

### `.dependencies([file])`

Returns an array of file paths. Accepts a single file argument to get the dependencies for, will return entire dependency graph in order if argument is omitted.

