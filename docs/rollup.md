# Rollup

`modular-css/rollup` provides a rollup build plugin you can use to transform imported `.css` files into lookup objects.

## Options

### `ext`

Extension to match on. Defaults to `.css`. Can be used in place of `include`/`exclude`.

### `include`/`exclude`

A minimatch pattern, or an array of minimatch patterns, relative to `process.cwd()`. Can be used in place of `ext`.

### `css`

Location to write the generated CSS file to.

### `json`

Location to write out the JSON mapping file for use in server rendering.

### `namedExports`

Set to `false` to disable named exports, instead only the default export wll be used. This is useful to avoid warnings when your classes aren't valid JS identifiers.

### Shared Options

All other options are passed to the underlying `Processor` instance, see [Options](api.md#processor-options).

## API

```js
rollup({
    entry   : "./index.js",
    plugins : [
        // Make sure it's the first entry in your plugin list to avoid syntax errors
        require("modular-css-rollup")({
            css : "./gen/index.css"
        })
    ]
}).then(function(bundle) {
    ...
});
```

## Config file

```js
import css from "modular-css-rollup";

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
