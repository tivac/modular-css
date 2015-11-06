modular-css
===========
[![NPM Version](https://img.shields.io/npm/v/modular-css.svg)](https://www.npmjs.com/package/modular-css)
[![NPM License](https://img.shields.io/npm/l/modular-css.svg)](https://www.npmjs.com/package/modular-css)
[![NPM Downloads](https://img.shields.io/npm/dm/modular-css.svg)](https://www.npmjs.com/package/modular-css)
[![Build Status](https://img.shields.io/travis/tivac/modular-css/master.svg)](https://travis-ci.org/tivac/modular-css)
[![Dependency Status](https://img.shields.io/david/tivac/modular-css.svg)](https://david-dm.org/tivac/modular-css)
[![devDependency Status](https://img.shields.io/david/dev/tivac/modular-css.svg)](https://david-dm.org/tivac/modular-css#info=devDependencies)

Provides a subset of [css-modules](https://github.com/css-modules/css-modules) via CLI/API/Browserify transform.

## Why?

CSS Modules is an amazing idea but mostly non-functional for our needs as of November 2015.

This seemed like an interesting problem and a chance to pick & choose the most attractive parts of the CSS Modules spec while leaving out parts that we found to be confusing in practice. I also wanted more experience with PostCSS and this seemed like a great way to accomplish that.

## Features

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

### Scoped CSS

By default all CSS selectors live in the global scope of the page and are chosen based on specificity rules. This has proven to be a model that makes it difficult to succeed and incredibly easy to blow off your own foot. Modular CSS scopes all selectors to the local file by default, ensuring that your CSS is always exactly as specific as it should be.

```css
.wooga { color: red; }

/* Becomes */

.f5507abd3eea0987714c5d92c3230347_wooga { color: red; }
```

By default the selector scoping is based off hashing the contents of the file but you can also provide your own custom function.

Using these now-mangled selectors would be problematic, if Modular CSS didn't give you the tools required to use them easily. When using the browserify transform any `require()` calls for CSS files will instead return an object where the keys match the classes/ids defined in the requested CSS file.

```js
var css = require("./styles.css");

// css is:
/*
{
    wooga : [ "f5507abd3eea0987714c5d92c3230347_wooga" ],
    ...
}
*/

// so mithril code (or any templating code!) can do the following
m("div", { class : css.wooga.join(" ") });
// which would output
// <div class="f5507abd3eea0987714c5d92c3230347_wooga"></div>
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
    global : [ "global" ]
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
    single : [
        "dafdfcc7dc876084d352519086f9e6e9_other",
        "aeacf0c6fbb2445f549ddc0fcfc1747b_single"
    ],
    multiple : [
        "dafdfcc7dc876084d352519086f9e6e9_more",
        "f5507abd3eea0987714c5d92c3230347_than",
        "aeacf0c6fbb2445f549ddc0fcfc1747b_one"
        // Since .multiple is only a singular composes: declaration there's no need
        // for it to be rewritten, it's left out of the output
    ],
    local : [
        "dafdfcc7dc876084d352519086f9e6e9_other",
        "aeacf0c6fbb2445f549ddc0fcfc1747b_single"
    ]
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

You can also get access to variables defined in other files via composition!

```css
@value first, second from "./somewhere-else.css";
@value npm from "some-node-module";
```

## Install

`$ npm i modular-css`

## Usage

### CLI

`$ modular-css ./entry.css`

Will process `./entry.css` and output the processed CSS to stdout

`$ modular-css ./entry.css ./gen/entry.css`

Will process `./entry.css` and output the processed CSS to `./gen/entry.css` as well as a JSON file containing the scoped mapping to `./gen/entry.css.json`.


### API

```js
var Processor = require("modular-css").Processor,
    mcss = new Processor(),
    output;

output = mcss.file("./entry.css");

// or

output = mcss.string("./entry.css", ".fooga { ... } ...");

// output now contains
//  .exports - Scoped selector mappings
//  .files - metadata about the file hierarchy

// The transformed css is available on the css property
output.css;
```

### Browserify

#### CLI

```
$ browserify -t [ modular-css --css "./style.css" ] client.js
```

#### API

```js
var browserify = require("browserify"),
    build;

build = browserify("./entry.js");

build.plugin("modular-css", {
    css : "./output/css/here.css"
    // You can also define a json property to get a dump
    // of all the walked CSS files and their exports for
    // use in server-side rendering
});

build.bundle(function(err, output) {
    ...
});
```

## Thanks

[@JoshGalvin](https://github.com/JoshGalvin) for ideas/encouragement to do this silly thing.

The CSS modules team for inspiration!

[@geelen](https://github.com/geelen)
[@joshgillies](https://github.com/joshgillies)
[@joshwnj](https://github.com/joshwnj)
[@markdalgleish](https://github.com/markdalgleish)
[@sokra](https://github.com/sokra)
[@sullenor](https://github.com/sullenor)
