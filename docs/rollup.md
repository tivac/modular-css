# Rollup

`modular-css-rollup` provides a rollup build plugin you can use to transform imported `.css` files into lookup objects.

## Options

### `include`/`exclude`

A minimatch pattern, or an array of minimatch patterns, relative to `process.cwd()`.

### `common`

File path to write any common CSS output to.

### `json`

File path to write out the JSON mapping file for use in server rendering.

### `namedExports`

Set to `false` to disable named exports, instead only the default export wll be used. This is useful to avoid warnings when your classes aren't valid JS identifiers.

### Shared Options

All other options are passed to the underlying `Processor` instance, see [Options](api.md#options).

## API

```js
const bundle = await rollup({
    input   : "./index.js",
    plugins : [
        // Make sure it's the first entry in your plugin list to avoid syntax errors
        require("modular-css-rollup")({
            common : "./dist/common.css"
        })
    ]
});
```

## Config file

```js
import css from "modular-css-rollup";

export default {
    input   : "./index.js",
    output : {
        file   : "./dist/bundle.js",
        format : "umd",
    },
    plugins : [
        css({
            common : "./dist/bundle.css"
        })
    ]
};
```
