modular-css [![NPM Version](https://img.shields.io/npm/v/modular-css.svg)](https://www.npmjs.com/package/modular-css) [![Build Status](https://img.shields.io/travis/tivac/modular-css/master.svg)](https://travis-ci.org/tivac/modular-css)
===========
<p align="center">
    <a href="https://www.npmjs.com/package/modular-css" alt="NPM License"><img src="https://img.shields.io/npm/l/modular-css.svg" /></a>
    <a href="https://www.npmjs.com/package/modular-css" alt="NPM Downloads"><img src="https://img.shields.io/npm/dm/modular-css.svg" /></a>
    <a href="https://david-dm.org/tivac/modular-css" alt="Dependency Status"><img src="https://img.shields.io/david/tivac/modular-css.svg" /></a>
    <a href="https://david-dm.org/tivac/modular-css#info=devDependencies" alt="devDependency Status"><img src="https://img.shields.io/david/dev/tivac/modular-css.svg" /></a>
</p>

Provides a subset of [css-modules](https://github.com/css-modules/css-modules) via:

- [API](#api)
  - [Processor](#processor)
  - [Globbing](#globbing)
- [CLI](#cli)
- [Browserify](#browserify) Plugin
- [Rollup](#rollup) Plugin

## Install

`$ npm i modular-css`

## Usage

### API

#### Processor

Instantiate a new `Processor` instance, call it's `.file(<path>)` or `.string(<name>, <contents>)` methods, and then use the returned Promise to get access to the results/output.

```js
var Processor = require("modular-css"),
    processor = new Processor({
        // See "API Options" for valid options to pass to the Processor constructor
    });

// Add entries, either from disk using .file() or as strings with .string()
Promise.all([
    processor.file("./entry.css".)then(function(result) {
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

##### Processor Options

###### `before`

Specify an array of PostCSS plugins to be run against each file before it is processed.

```js
new Processor({
    before : [ require("postcss-import") ]
});
```
###### `after`

Specify an array of PostCSS plugins to be run after files are processed, but before they are combined. Plugin will be passed a `to` and `from` option.

**By default** [`postcss-url`](https://www.npmjs.com/package/postcss-url) is used in `after` mode.

```js
new Processor({
    after : [ require("postcss-someplugin") ]
});
```

###### `done`

Specify an array of PostCSS plugins to be run against the complete combined CSS.

```js
new Processor({
    done : [ require("cssnano")()]
});
```

###### `map`

Enable source map generation. Can also be passed to `.output()`.

**Default**: `false`

```js
new Processor({
    map : true
});
```

###### `cwd`

Specify the current working directory for this Processor instance, used when resolving `composes`/`@value` rules that reference other files.

**Default**: `process.cwd()`

```js
new Processor({
    cwd : path.join(process.cwd(), "/sub/dir")
})
```

###### `namer`

Specify a function (that takes `filename` & `selector` as arguments to produce scoped selectors.

**Default**: Function that returns `"mc" + unique-slug(<file>) + "_" + selector`

```js
new Processor({
    namer : function(file, selector) {
        return file.replace(/:\/\\ /g, "") + "_" + selector;
    }
});
```

#### Globbing

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

##### Glob Options

###### `search`

Array of glob patterns to pass to [`globule`](https://www.npmjs.com/package/globule) for searching.

### CLI

`$ modular-css ./entry.css`

Will process `./entry.css` and output the processed CSS to stdout

`$ modular-css ./entry.css ./gen/entry.css`

Will process `./entry.css` and output the processed CSS to `./gen/entry.css` as well as a JSON file containing the scoped mapping to `./gen/entry.css.json`.

### Browserify

`modular-css` can be used as a browserify plugin, it can also be combined with the `factor-bundle` plugin to output a common CSS file as well as bundle-specific CSS files.

The `modular-css` plugin will use the `basedir` passed to browserify as it's `cwd` parameter.

#### Options

##### `css`

Location to write the generated CSS file to.

##### Shared Options

All other options are passed to the underlying `Processor` instance, see [Options](#options-2).

#### CLI

```
$ browserify -p [ modular-css/browserify --css "./style.css" ] entry.js
```

#### API

```js
var browserify = require("browserify"),
    build;

build = browserify("./entry.js");

build.plugin("modular-css/browserify", {
    css : "./style.css",
});
```

#### factor-bundle

The `modular-css` browserify plugin is fully factor-bundle aware and will output correctly-partitioned CSS bundles to match the JS bundles created by factor-bundle.

**WARNING**: Due to how `factor-bundle` works the `modular-css/browserify` plugin must be applied to the Browserify object **before** `factor-bundle`.

##### CLI

```
$ browserify home.js account.js \
    -p [ modular-css/browserify --css gen/common.css ] \
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
build.plugin("modular-css/browserify", {
    css : "./gen/common.css"
});

build.plugin("factor-bundle", {
    outputs : [
        "./gen/home.js",
        "./get/account.js"
    ]
});
```

### Rollup

`modular-css/rollup` provides a rollup build plugin you can use to transform imported `.css` files into lookup objects.

#### Options

##### `css`

Location to write the generated CSS file to.

##### Shared Options

All other options are passed to the underlying `Processor` instance, see [Options](#options-2).

#### API

```js
rollup({
    entry   : "./index.js",
    plugins : [
        require("modular-css/rollup")({
            css : "./gen/index.css"
        })
    ]
}).then(function(bundle) {
    ...
});
```

#### Config file

```js
import css from "modular-css/rollup";

export default {
    entry   : "./index.js",
    dest    : "./gen/bundle.js",
    format  : "umd",
    plugins : [
        css({
            css : "./gen/index.css"
        })
    ]
};
```

## Why?

CSS Modules is a great idea but has been to slow to fix issues blocking me from being able to use it. To prove out the idea I built `modular-css`. In general `modular-css` is a implementation of the most useful parts of the CSS Modules spec. It unavoidably deviates in a few places to try and improve end-user consistency.

<p align="center">
    <a href="https://twitter.com/iamdevloper/status/636455478093029376">
        <img src="https://i.imgur.com/dRVweC6.png" alt="Green pills look gross" />
    </a>
</p>

## Features

CSS Modules defines a bunch of great features, and `modular-css` supports the best of them in a straightforward and consistent way.

- [Values](#values)
- [Scoped Selectors](#scoped-selectors)
- [Composition](#composition)

### Values

Values are useful in CSS, they're coming to the spec soon. Use them now because it'll make your life easier!

```css
/* values.css */
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
/* styles.css */
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

### Composition

Selector limitations mean that it's difficult to use complicated selectors, so to enable building anything of complexity you can compose selectors. These compositions can be within a file or even pull in classes defined in other files.

```css
/* styles.css */
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

## Thanks

[@JoshGalvin](https://github.com/JoshGalvin) for ideas/encouragement to do this silly thing.

The CSS modules team for inspiration!

- [@geelen](https://github.com/geelen)
- [@joshgillies](https://github.com/joshgillies)
- [@joshwnj](https://github.com/joshwnj)
- [@markdalgleish](https://github.com/markdalgleish)
- [@sokra](https://github.com/sokra)
- [@sullenor](https://github.com/sullenor)

## A Note on Versioning ##

This project's version number currently has a "0.x" prefix, indicating that it's a young
project under heavy development. **As long as the version number starts with
"0.x", minor revisions may introduce breaking changes.**

You've been warned!

Once it reaches version 1.0.0, it will adhere strictly to [SemVer 2.0](http://semver.org/spec/v2.0.0.html).
