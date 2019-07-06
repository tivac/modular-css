### JS API

The heart of `modular-css`, the JS API is a `Processor` that will be fed files, transform them, then barf out their bones...

Or, you know, their CSS. One of those for sure.

#### Processor Usage

Instantiate a new `Processor` instance, call `.file(<path>)` or `.string(<name>, <contents>)` methods, and then use the returned Promise to get access to the results/output.

```js
const Processor = require("modular-css");
const processor = new Processor({
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

#### Processor Options

##### `rewrite`

Enable or disable the usage of [`postcss-url`](https://www.npmjs.com/package/postcss-url) to correct any URL references within the CSS. The value of `rewrite` will be passed to `postcss-url` to allow for configuration of the plugin.

**Default**: `true`

```js
// On by default, so this will have rewritten url() references
new Processor();

// A falsey value will disable the usage of postcss-url,
// url() references will not be changed
new Processor({ rewrite : false });

// Configure postcss-url
new Processor({
    rewrite : {
        url : "inline"
    }
});
```

##### `map`

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
        inline : false
    }
});
```

##### `cwd`

Specify the current working directory for this Processor instance, used when resolving `composes`/`@value` rules that reference other files.

**Default**: `process.cwd()`

```js
new Processor({
    cwd : path.join(process.cwd(), "/sub/dir")
})
```

##### `namer`

Specify a function (that takes `filename` & `selector` as arguments) to produce scoped selectors.

Can also pass a string that will be `require()`'d and evaluated, it should return the namer function.

**Default**: Function that returns `"mc" + unique-slug(<file>) + "_" + selector`

```js
new Processor({
    namer : function(file, selector) {
        return file.replace(/[:\/\\ .]/g, "") + "_" + selector;
    }
});

// or

new Processor({
    namer : "@modular-css/shortnames"
});
```

##### `resolvers`

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
        require("@modular-css/path-resolver")(
            "./some/other/path"
        )
    ]
})
```

##### `exportGlobals`

By default identifiers wrapped in `:global(...)` are exported for ease of referencing via JS. By setting `exportGlobals` to `false` that behavior can be deactivated. Mostly useful to avoid warnings when global CSS properties are not valid JS identifiers.

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

##### `dupewarn`

Boolean value that determines whether or not the Processor instance will issue warnings for duplicate seeming files (identical path with only case variations). If you're using a case-sensitive filesystem feel free to disable by setting it to `false`.

**Default**: `true`, so warnings are emitted.

```js
new Processor({
    dupewarn : true
});
```

#### Processor Properties

##### `.files`

Returns an object keyed by absolute file paths of all known files in the `Processor` instance.

##### `.options`

Returns the options object passed to the `Processor` augmented with the defaults.

#### Processor API

##### `.string(file, css)`

Returns a promise. Add `file` to the `Processor` instance with `css` contents.

##### `.file(file)`

Returns a promise. Add `file` to the `Processor` instance, reads contents from disk using `fs`.

##### `.output([files])`

Returns a promise. Finalize processing of all added CSS and create combined CSS output file. Optionally allows for combining a subset of the loaded files by passing a single file or array of files.

**WARNING**: Calling `.output()` before any preceeding `.file(...)`/`.string(...)` calls have resolved their returned promises will return a rejected promise. See [usage](#usage) for an example of correct usage.

##### `.remove([files])`

Remove files from the `Processor` instance. Accepts a single file or array of files.

##### `.dependencies([file])`

Returns an array of file paths. Accepts a single file argument to get the dependencies for, will return entire dependency graph in order if argument is omitted.

