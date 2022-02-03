@modular-css/browserify  [![NPM Version](https://img.shields.io/npm/v/@modular-css/browserify.svg)](https://www.npmjs.com/package/@modular-css/browserify) [![NPM License](https://img.shields.io/npm/l/@modular-css/browserify.svg)](https://www.npmjs.com/package/@modular-css/browserify) [![NPM Downloads](https://img.shields.io/npm/dm/@modular-css/browserify.svg)](https://www.npmjs.com/package/@modular-css/browserify)
===========

Browserify support for [`modular-css`](https://github.com/tivac/modular-css).

This plugin can be combined with the `factor-bundle` plugin to output a common CSS file as well as bundle-specific CSS files.

`@modular-css/browserify` will use the `basedir` passed to browserify as it's `cwd` parameter.

- [Install](#install)
- [Options](#options)
- [CLI](#cli)
- [API](#api)
- [factor-bundle](#factor-bundle)

## Install

```bash
$ npm i @modular-css/browserify
```

## Options

### `css`

Location to write the generated CSS file to.

### Shared Options

All other options are passed to the underlying `Processor` instance, see [Options](../processor/README.md#options).

## CLI

```
$ browserify -p [ @modular-css/browserify --css "./style.css" ] entry.js
```

## API

```js
var browserify = require("browserify"),
    build;

build = browserify("./entry.js");

build.plugin("@modular-css/browserify", {
    css : "./style.css",
});
```

## factor-bundle

`@modular-css/browserify` is fully `factor-bundle` aware and will output correctly-partitioned CSS bundles to match the JS bundles created by `factor-bundle`.

**WARNING**: Due to how `factor-bundle` works the `@modular-css/browserify` plugin must be applied to the Browserify object **before** `factor-bundle`.

### CLI

```
$ browserify home.js account.js \
    -p [ @modular-css/browserify --css gen/common.css ] \
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
