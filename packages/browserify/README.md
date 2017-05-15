modular-cssify  [![NPM Version](https://img.shields.io/npm/v/modular-cssify.svg)](https://www.npmjs.com/package/modular-cssify) [![NPM License](https://img.shields.io/npm/l/modular-cssify.svg)](https://www.npmjs.com/package/modular-cssify) [![NPM Downloads](https://img.shields.io/npm/dm/modular-cssify.svg)](https://www.npmjs.com/package/modular-cssify) ===========

`modular-cssify` is a browserify plugin that enables `modular-css` within browserify bundles. It can also be combined with the `factor-bundle` plugin to output a common CSS file as well as bundle-specific CSS files.

`modular-cssify` will use the `basedir` passed to browserify as it's `cwd` parameter.

## Installation

```bash
$ npm i modular-cssify
```

## Options

### `css`

Location to write the generated CSS file to.

### Shared Options

All other options are passed to the underlying `Processor` instance, see [Options](api.md#processor-options).

## CLI

```
$ browserify -p [ modular-cssify --css "./style.css" ] entry.js
```

## API

```js
var browserify = require("browserify"),
    build;

build = browserify("./entry.js");

build.plugin("modular-cssify", {
    css : "./style.css",
});
```

## factor-bundle

`modular-cssify` is fully `factor-bundle` aware and will output correctly-partitioned CSS bundles to match the JS bundles created by `factor-bundle`.

**WARNING**: Due to how `factor-bundle` works the `modular-cssify` must be applied to the Browserify object **before** `factor-bundle`.

### CLI

```
$ browserify home.js account.js \
    -p [ modular-cssify --css gen/common.css ] \
    -p [ factor-bundle -o gen/home.js -o gen/account.js ] \
    -o bundle/common.js
```

### API

```js
var build = browserify([
        "./home.js",
        "./account.js"
    ]);

// NOTE modular-css applied before factor-bundle, it won't work otherwise!
build.plugin("modular-cssify", {
    css : "./gen/common.css"
});

build.plugin("factor-bundle", {
    outputs : [
        "./gen/home.js",
        "./get/account.js"
    ]
});
```
