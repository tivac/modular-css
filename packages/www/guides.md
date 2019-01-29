## Getting Started

There are a lot of different ways to use `modular-css`, pick your favorite!

- [Rollup](#rollup) - Tiny bundles, code-splitting, and first-class `modular-css` support. 👌🏻
- [Webpack](#webpack) - Not as full-featured or well-supported as the rollup plugin but works pretty ok.
- [Browserify](#browserify) - The old standby. Supports `factor-bundle` for painless CSS bundle splitting!
- [Svelte](#svelte) - Take your svelte components and power them up using `modular-css`! ⚡
- [JS API](#js-api) - The core of `modular-css`, reasonably usable and powers literally everything else.
- [CLI](#cli) - `modular-css` via CLI, for those times where you need to try something really quickly.
- [PostCSS Plugin](#postcss-plugin) - Sometimes just gotta run some postcss inside of your postcss. 😵
- [Globbing API](#)- Grab `**/*.css` and get a move on. The globbing API is here for you!

### rollup

Rollup support for [`modular-css`](https://github.com/tivac/modular-css).

#### Install

```bash
> npm i @modular-css/rollup
```

#### Usage

#### Usage via API

```js
const bundle = await rollup({
    input   : "./index.js",
    plugins : [
        require("@modular-css/rollup")()
    ]
});
```

#### Usage via `rollup.config.js`

```js
import css from "@modular-css/rollup";

export default {
    input   : "./index.js",
    output  : {
        dest    : "./gen/bundle.js",
        format  : "umd"
    },
    plugins : [
        css()
    ]
};
```

#### rollup Options

##### `common`

File name to use in case there are any CSS dependencies that appear in multiple bundles. Defaults to "common.css".

##### `dev`

Enable dev mode. In dev mode the default export of a CSS file will be a `Proxy` instead of a bare object. Attempts to access non-existant properties on the proxy will throw a `ReferenceError` to assist in catching invalid usage.

##### `include`/`exclude`

A minimatch pattern, or an array of minimatch patterns, relative to `process.cwd()`. `include` defaults to `**/*.css`.

##### `json`

Boolean/String to determine if JSON files containing all exported classes & values should be output. If set to `true` will write out to a file named `exports.json`. If a `String` will write out to that file name. Defaults to `false`.

##### `map`

Boolean to determine if inline source maps should be included. Defaults to `true`.

To force the creation of external source maps set the value to `{ inline : false }`.

##### `meta`

Boolean/String to determine if chunk metadata should be output. If set to true will write out a file named `metadata.json`. If a `String` will write out to that file name. Defaults to `false`.

Currently the only metadata being written is CSS dependencies, but that may change in the future.

##### `namedExports`

By default this plugin will create both a default export and named `export`s for each class in a CSS file. You can disable this by setting `namedExports` to `false`.

##### `styleExport`

By default this plugin will extract and bundle CSS in a separate file. If you would like the styles from each imported CSS file to be exported as a string for use in JS, you can enable this by setting `styleExport` to `true`. If you are using this option the `after` & `done` hooks **will not run against the exported styles**, you should perform any additional CSS transformations in the `processing` hook instead.

```js
import { styles } from "./styles.css";
```

Enable `styleExport` will also disable the plugin from emitting any assets as well as sourcemaps (unless you explicitly opt-in to sourcemaps via the `map` option)

##### `processor`

Pass an already-instantiated `Processor` instance to the rollup plugin. It will then add any files found when traversing the modules to it and both the rollup-discovered and any already-existing files will be output in the final CSS.

##### Shared Options

All other options are passed to the underlying `Processor` instance, see [Options](#options).

### webpack

Webpack 2/3/4 support for [`modular-css`](https://github.com/tivac/modular-css).

This package contains two entry points, you will need to use **both** in tandem for things to work!

1. `@modular-css/webpack/plugin` provides a webpack plugin you can use to transform imported `.css` files into lookup objects while outputting CSS to disk.

2. `@modular-css/webpack/loader` provides the file loader that does the actual transformation on files.

- [Install](#install)
- [Usage](#usage)
- [Options](#options)

#### webpack Install

```bash
> npm i @modular-css/webpack
```

#### Usage

```js
// webpack.config.js
const path = require("path");
    
const CSSPlugin = require("@modular-css/webpack/plugin");

module.exports = {
    entry   : "./input.js",
    output  : {
        path : path.resolve(__dirname, "dist"),
        filename : "./output.js"
    },
    module : {
        rules : [{
            test : /\.css$/,
            use  : "@modular-css/webpack/loader"
        }]
    },
    plugins : [
        new CSSPlugin({
            css  : "./output.css",
            json : "./output.json"
        })
    ]
});
```

#### webpack Plugin Options

##### `css`

Location to write the generated CSS file to, relative to `output.path` just like `output.filename`

##### `json`

Location to write out the JSON mapping file to, relative to `output.path` just like `output.filename`

##### `processor`

Pass an already-instantiated `Processor` instance to the Webpack plugin. It will then add any files found when traversing the modules to it and both the Webpack-discovered and any already-existing files will be output in the final CSS.

##### Shared Options

All other options are passed to the underlying `Processor` instance, see the [Processor Options](#processor-options)..

#### webpack Loader Options

##### `namedExports`

By default this plugin will create both a default export and named `export`s for each class in a CSS file. You can disable this by setting `namedExports` to `false`.

```js
...
    module : {
        rules : [{
            test : /\.css$/,
            use  : {
                loader  : "@modular-css/webpack/loader",
                options : {
                    namedExports : false
                }
            }
        }]
    },
...
```

### browserify

Browserify support for [`modular-css`](https://github.com/tivac/modular-css).

This plugin can be combined with the `factor-bundle` plugin to output a common CSS file as well as bundle-specific CSS files.

`@modular-css/browserify` will use the `basedir` passed to browserify as it's `cwd` parameter.

- [Install](#install)
- [Options](#options)
- [CLI](#cli)
- [API](#api)
- [factor-bundle](#factor-bundle)

#### Install

```bash
$ npm i @modular-css/browserify
```

#### Options

##### `css`

Location to write the generated CSS file to.

##### Shared Options

All other options are passed to the underlying `Processor` instance, see the [Processor Options](#processor-options).

#### CLI

```
$ browserify -p [ @modular-css/browserify --css "./style.css" ] entry.js
```

#### API

```js
var browserify = require("browserify"),
    build;

build = browserify("./entry.js");

build.plugin("@modular-css/browserify", {
    css : "./style.css",
});
```

#### factor-bundle

`@modular-css/browserify` is fully `factor-bundle` aware and will output correctly-partitioned CSS bundles to match the JS bundles created by `factor-bundle`.

**WARNING**: Due to how `factor-bundle` works the `@modular-css/browserify` must be applied to the Browserify object **before** `factor-bundle`.

##### CLI

```
$ browserify home.js account.js \
    -p [ @modular-css/browserify --css gen/common.css ] \
    -p [ factor-bundle -o gen/home.js -o gen/account.js ] \
    -o bundle/common.js
```

##### API

```js
var build = browserify([
        "./home.js",
        "./account.js"
    ]);

// NOTE modular-css applied before factor-bundle, it won't work otherwise!
build.plugin("@modular-css/browserify", {
    css : "./gen/common.css"
});

build.plugin("factor-bundle", {
    outputs : [
        "./gen/home.js",
        "./get/account.js"
    ]
});
```

### svelte

Svelte preprocessor support for [`modular-css`](https://github.com/tivac/modular-css). Process inline `<style>`s or `<link>` references inside your Svelte components using the full power of `modular-css` while also providing compile-time optimizations for smaller bundles and even faster runtime performance!

#### Example

Turns this

```html
<div class="{css.main}">
    <h1 class="{css.title}">Title</h1>
</div>

<style>
    .main {
        ...
    }
    
    .title {
        ...
    }
</style>
```

into what is effectively this

```html
<div class="abc123_main">
    <h1 class="abc123_title">Title</h1>
</div>
```

while allowing you to use all of the usual `modular-css` goodies.

Alternatively you can use `<link href="./file.css" />` tags to reference CSS external to the component.

- [Install](#install)
- [Usage](#usage)
- [Options](#options)

#### Install

```bash
> npm i @modular-css/svelte -D
```

#### Usage

##### `svelte.preprocess()`

```js
const filename = "./Component.html";

const { processor, preprocess } = require("@modular-css/svelte")({
    // Processor options
});

const processed = await svelte.preprocess(
    fs.readFileSync(filename, "utf8"),
    Object.assign({}, preprocess, { filename })
);

const result = await processor.output();

fs.writeFileSync("./dist/bundle.css", result.css);
```

##### `@modular-css/rollup`

###### API

```js
const rollup = require("rollup").rollup;

const { preprocess, processor } = require("@modular-css/svelte")({
    // Processor options
});

const bundle = await rollup({
    input   : "./Component.html",
    
    plugins : [
        require("rollup-plugin-svelte")({
            preprocess,
        }),

        require("@modular-css/rollup")({
            processor,

            common : "common.css",
        }),
    ]
});

// bundle.write will also write out the CSS to the path specified in the `css` arg
bundle.write({
    format : "es",
    file   : "./dist/bundle.js"
});
```

###### `rollup.config.js`

```js
const { preprocess, processor } = require("@modular-css/svelte")({
    // Processor options
});

module.exports = {
    input   : "./Component.html",
    
    output  : {
        format : "es",
        file   : "./dist/bundle.js"
    },

    plugins : [
        require("rollup-plugin-svelte")({
            preprocess,
        }),
        
        require("@modular-css/rollup")({
            processor,

            common : "common.css",
        }),
    ]
};
```

#### Options

##### `strict`

If `true` whenever a missing replacement is found like `{css.doesnotexist}` an error will be throw aborting the file processing. Defaults to `false`.

##### `clean`

If `true` will re-process any previously handled files (and remove any files that dependended on them). Might be useful, but currently also dangerous (see [#522](https://github.com/tivac/modular-css/issues/522)). Defaults to `false`.

##### Shared Options

All options are passed to the underlying `Processor` instance, see the [Processor Options](#processor-options).

### JS API

The heart of `modular-css`, the JS API is a `Processor` that will be fed files, transform them, then spit out their bones...

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


### CLI

CLI interface to [`modular-css`](https://github.com/tivac/modular-css).

#### CLI Install

```bash
$ npm i @modular-css/cli
```

#### CLI Usage

```
$ modular-css [options] <glob>...

Options
--dir,     -d <dir>    Directory to search from [process cwd]
--out,     -o <file>   File to write output CSS to [stdout]
--json,    -j <file>   File to write output compositions JSON to
--map,     -m          Include inline source map in output
--rewrite, -r          Control rewriting of url() references in CSS
--help                 Show this help
```

### PostCSS

`@modular-css/postcss` provides a PostCSS plugin that can be used like any other. It will output a message with a `type` of `modular-css-exports` containing all the exported class compositions.

#### PostCSS Install

```bash
> npm i @modular-css/postcss
```

#### PostCSS Usage (via API)

```js
const postcss = require("postcss");
const processor = postcss([
    require("@modular-css/postcss")({
        json : "./path/to/output.json"
    })
]);

const result = await processor.process("<css>")

// result.css
// result.map
// result.messages.find((msg) => msg.type === "modular-css-exports")
// etc
```

#### PostCSS Usage (via config)

```bash
> postcss --config postcss.json input.css
```

```json
{
    "output" : "out.css",
    
    "@modular-css/postcss": {
        "json" : "./path/to/output.json"
    }
}

```

#### PostCSS Usage (via CLI)

```bash
> postcss --use modular-css/postcss input.css
```

#### PostCSS Options

##### `json`

Write the class composition data to this location on disk.

##### Shared Options

All other options are passed to the underlying `Processor` instance, see [Processor Options](#processor-options).

### glob

A JS API for using glob patterns with [`modular-css`](https://github.com/tivac/modular-css).

- [Install](#install)
- [Usage](#usage)
- [Options](#options)

#### Install

`$ npm i @modular-css/glob`

#### Usage

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

#### Options

`glob()` accepts all of the same options as laid out in the [Processor Options](#processor-options).

###### `search`

Array of glob patterns to pass to [`globule`](https://www.npmjs.com/package/globule) for searching.

## Features

`modular-css` implements the best features of the CSS Modules spec and then adds on several extra features to make for a smoother developer experience.

### Scoped Selectors

By default all CSS selectors live in the global scope of the page and are chosen based on specificity rules. This has proven to be a model that makes it difficult to succeed and incredibly easy to blow off your own foot. `modular-css` scopes all selectors to the local file by default, ensuring that your CSS is always exactly as specific as it should be.

```css
.wooga { color: red; }

/* Becomes */

.f5507abd_wooga { color: red; }
```

By default the selector scoping is based off hashing the contents of the file but you can also provide your own custom function.

Using these now-mangled selectors would be problematic, if `modular-css` didn't give you the tools required to use them easily. When using the browserify transform any `require()` calls for CSS files will instead return an object where the keys match the classes/ids defined in the requested CSS file.

```js
var css = require("./styles.css");

// css is:
/*
{
    wooga : "f5507abd3_wooga",
    ...
}
*/

// so mithril code (or any templating code!) can do the following
m("div", { class : css.wooga });
// which would output
// <div class="f5507abd_wooga"></div>
```

These arrays of selectors can then be applied to elements using the much more nicely-named object keys and you're off to the races.

You can opt out of selector scoping by wrapping your classes/ids in the `:global()` pseudo-class, this will prevent them from being renamed but they will still be available in the module's exported object.

```css
/* == styles.css == */
:global(.global) { color: red; }
```
```js
var css = require("./styles.css");

// css is:
/*
{
    global : "global"
}
*/
```

Selector scoping is **only** done on simple classes/ids, any selectors containing tags or pseudo-selectors won't be exported.

`:global()` is treated the same as a CSS pseudo-class and therefore cannot wrap multiple comma seperated rules. For example if you're using a CSS reset the following is required:

```css
/* Local Scoped */
ol, ul {
    list-style: none;
}

/* Global Scoped (Wrong!) */
:global(ol, ul) {
    list-style: none;
}

/* Global Scoped (Correct!) */
:global(ol), :global(ul) {
    list-style: none;
}
```

Adding `:global()` to every comma seperated rule would be tedious when using something like [Eric Meyer's CSS Reset](http://meyerweb.com/eric/tools/css/reset/). Therefore it is recommended that you seperate the reset in to its own file, and make use of the [postcss-import](https://github.com/postcss/postcss-import) module with the [after](https://github.com/tivac/modular-css/blob/master/docs/api.md#after) or [done](https://github.com/tivac/modular-css/blob/master/docs/api.md#done) hooks to include the file when modular-css has finished processing. You would then need to include `@import "reset.css";` somewhere in one of your CSS files.

### Composition

Selector limitations mean that it's difficult to use complicated selectors, so to enable building anything of complexity you can compose selectors. These compositions can be within a file or even pull in classes defined in other files.

```css
/* == styles.css == */
.single {
    composes: other from "./other.css";
    color: red;
}

.multiple {
    composes: more, than, one from "./multiple.css";
    /*
    Since .multiple doesn't declare any rules other than composes
    aggregate styles from other rules it will be stripped from the output
    */
}

.local {
    composes: single;
}
```

When this file is required the JS object will contain the expected keys, but the arrays will now contain more values.

```js
var css = require("./styles.css");

// css is:
/*
{
    single   : "dafdfcc_other aeacf0c_single",
    // Since .multiple is only a singular composes: declaration there's no need
    // for it to be rewritten, it's left out of the output
    multiple : "dafdfcc_more f5507abd_than aeacf0c_one",
    local    : "dafdfcc_other aeacf0c_single"
}
*/
```

If you're going to be doing a lot of composition with another file you can store the filename into a value for ease of referencing.

```css
@value guide: "../style-guide.css";

.head {
    composes: heading from guide;
    font-size: 120%;
}

.body {
    composes: body from guide;
    padding: 10px;
}
```

You can also get access to variables defined in other files for simple sharing of useful information.

```css
@value first, second from "./somewhere-else.css";
```

### Overriding Styles

Sometimes a component will need some customization for use in a specific location/design, but you don't want to bake that customization into the component.`:external(...)` helps you solve that problem.

In this case we've got an `input` component that is normally 100% of the width of its container, but when it's within the `fieldset` component it should only be half as wide.

```css
/* == input.css == */
.input {
    width: 100%;
}

/* == fieldset.css == */
.fieldset :external(input from "./input.css") {
    width: 50%;
}
```
### Values

Values are re-usable pieces of content that can be used instead of hardcoding colors, sizes, media queries, or most other forms of CSS values. They're automatically replaced during the build with their defined value, and can also be composed between files for further re-use or overriding.

```css
/* == values.css == */
@value alert: #F00;
@value small: (max-width: 600px);

@media small {
    .alert { color: alert; }
}

/* will be output as */

@media (max-width: 600px) {
    .alert { color: #F00; }
}
```

### Importing Values

`@value`s can be imported from another file by using a slightly different syntax.

```css
/* == colors.css == */
@value main: red;
@value bg: white;

/* == site.css == */
@value main from "./colors.css";

body {
    color: main;
}
```

It's also possible to import multiple values at once.

```css
/* == colors.css == */
@value main: red;
@value bg: white;

/* == site.css == */
@value main, bg from "./colors.css";

body {
    color: main;
    background: bg;
}
```

### Namespaced Imports

`@value`s can be imported as a namespace which provides a convenient shorthand way to access a bunch of shared values from a file.

```css
/* == colors.css == */
@value main: red;
@value bg: white;

/* == site.css == */
@value * as colors from "./colors.css";

body {
    color: colors.main;
    background: colors.bg;
}
```

### Wildcard Imports

It's possible to import all the `@value` definitions from another file into the current one. Any local `@value` declarations will override the imported values.

```css
/* == colors.css == */
@value main: red;
@value bg: white;

/* == site.css == */
@value * from "./colors.css";
@value bg: black;

body {
    background: bg; /* black */
    color: main; /* red */
}
```

Since all files in `modular-css` with `@value` declaration make that value available to other files it's possible to use the wildcard imports feature to build complex theming systems. When using wildcard imports all the `@value`s from the source file are re-exported by the file doing the importing.

```css
/* == colors.css == */
@value main: red;
@value bg: white;

/* == mobile-colors.css == */
@value * from "./colors.css";
@value bg: gray;

/* == site.css == */
@value * as colors from "./mobile-colors.css";

body {
    background: colors.bg; /* gray */
    color: colors.main; /* red */
}
```


## vs CSS Modules

While `modular-css` has been built directly off the CSS Modules spec during the course of development some decisions have been made that have broken 100% compatibility. In general these changes have been made in an attempt to try and add consistency to the spec. There have also been a few feature additions that enable solving new classes of problems or fix pain points in the spec.

### :global

In CSS Modules the `:global` pseudo-class allows usage with or without parentheses around its arguments.

```css
/* CSS Modules */
:global .one { ... }
:global(.one) { ... }
```

In `modular-css` only the parenthesized form is allowed to reduce ambiguity around which selectors/names are being made global.

```css
/* modular-css */
:global(.one) { ... }
```

### Scope

In CSS Modules it is possible to switch back and forth from local and global scope using `:global` and `:local`.

```css
/* CSS Modules */
.localA :global .global-b .global-c :local(.localD.localE) .global-d { ... }
```

In `modular-css` all CSS is local by default, and since `:global()` is [required to use parentheses](#global-requires-parentheses) there is no need for the `:local` pseudo.

```css
/* modular-css */
.localA :global(.global-b .global-c) .localD.localE :global(.global-d) { ... }
```

### Style overriding

In CSS Modules there is no support for modifying styles in rules that aren't direct ancestors via `composes`.

Discussion around potential solutions is happening here, [css-modules/css-modules#147](https://github.com/css-modules/css-modules/issues/147).

`modular-css` has implemented the `:external()` proposal from that issue. More context is available in the [Overriding Styles section](#overriding-styles).

```css
/* input.css */
.input {
    width: 100%;
}

/* fieldset.css */
.fieldset :external(input from "./input.css") {
    width: 50%;
}
```

### Namespaces

CSS Modules allows for importing multiple values from an external file.

```css
/* CSS Modules */
@value one, two, three, red, blue, green, small, medium, large from "./constants.css";

.a {
  color: red;
  width: small;
}
```

`modular-css` implements a suggestion made in [css-modules/css-modules#186](https://github.com/css-modules/css-modules/issues/186#issuecomment-257421710) to allow importing all of a file's exported values and aliasing it for easy use. More documentation can be found in the [Namespaced Imports section](#namespaced-imports).

```css
/* modular-css */
@value * as constants from "./constants.css";

.a {
  color: constants.red;
  width: constants.small;
}
```

## Extending

There are 4 built-in ways to extend the functionality of `modular-css`, the lifecycle hooks. They all can be used to add any number of [PostCSS Plugins](https://github.com/postcss/postcss/blob/master/docs/plugins.md) to `modular-css` at specific points in the processing cycle.

### `before` hook

The `before` hook is run before a CSS file is ever processed by `modular-css`, so it provides access to rewrite files if they aren't actually CSS or contain non-standard syntax. Plugins like [`postcss-nested`](https://github.com/postcss/postcss-nested) go well here.


#### `before` usage

Specify an array of PostCSS plugins to be run against each file before it is processed. Plugin will be passed a `from` option.

```js
new Processor({
    before : [ require("postcss-import") ]
});
```

### `processing` hook

The `processing` hook is run after `modular-css` has parsed the file, but before any response to [`processor.string`](api.md#string) or [`processor.file`](api.md#file) is returned. Plugins in this hook have a special power: they can change the exports of the file.

This works by having the plugin push an object onto the `result.messages` array. Here's a very simple example:

```js
new Processor({
    processing : [
        (css, result) => {
            result.messages.push({
                plugin  : "modular-css-exporter",
                exports : {
                    a : true,
                    b : false
                }
            });
        }
    ]
})
```

The `plugin` field must begin with "modular-css-export", and the `exports` field should be the object to be mixed into the exports of the CSS file. It will be added last, so it can be used to override the default exports if desired.

#### `processing` usage

Specify an array of PostCSS plugins to be run against each file during processing. Plugin will be passed a `from` option.

```js
new Processor({
    processing : [ require("postcss-import") ]
});
```

### `after` hook

The `after` hook is run once the output location for the CSS is known, but before all the files are combined. By default it will run [`postcss-url`](https://github.com/postcss/postcss-url) to rebase file references based on the final output location, but this can be disabled using the [`rewrite`](api.md#rewrite) option.

Since all manipulations on the file are complete at this point it is a good place to run plugins like [`postcss-import`](https://github.com/postcss/postcss-import) to inline `@import` rules. The rules inlined in this way won't be scoped so it's a convenient way to pull in 3rd party code which can be included in the selector heirarchy via `composes`.

```css
@import "bootstrap.css";

/* Will export as "btn .abc123_button" */
.button {
    composes: global(btn);
}
```

#### `after` usage

Specify an array of PostCSS plugins to be run after files are processed, but before they are combined. Plugin will be passed a `to` and `from` option.

**Default**: `[]`

:warning: [`postcss-url`](https://www.npmjs.com/package/postcss-url) automatically runs after any plugins defined in the `after` hook. To disable it use the [`rewrite`](#rewrite) option.

```js
new Processor({
    after : [ require("postcss-someplugin") ]
});
```

### `done` hook

The `done` hook is run after all of the constituent files are combined into a single stylesheet. This makes it a good place to add tools like [`cssnano`](http://cssnano.co/) that need access to the entire stylesheet to be able to accurately optimize the CSS.

#### `done` usage

Specify an array of PostCSS plugins to be run against the complete combined CSS. Plugin will be passed a `to` option.

```js
new Processor({
    done : [ require("cssnano")()]
});
```

