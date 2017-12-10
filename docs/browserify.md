# Browserify

`modular-cssify` provides a browserify plugin that exposes `modular-css` functionality. It can also be combined with the `factor-bundle` plugin to output a common CSS file as well as bundle-specific CSS files.

The `modular-cssify` plugin will use the `basedir` passed to browserify as it's `cwd` parameter.

## Options

### `css`

Location to write the generated CSS file to.

### `json`

Location to write out the JSON mapping file for use in server rendering.

### Shared Options

All other options are passed to the underlying `Processor` instance, see [Options](api.md#options).

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

## `factor-bundle`

The `modular-cssify` is fully `factor-bundle` aware and will output correctly-partitioned CSS bundles to match the JS bundles created by `factor-bundle`.

**WARNING**: Due to how `factor-bundle` works the `modular-cssify` plugin must be applied to the Browserify object **before** `factor-bundle`.

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
