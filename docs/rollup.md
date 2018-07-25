# Rollup

`modular-css-rollup` provides a rollup build plugin you can use to transform imported `.css` files into lookup objects.

## Options

### `common`

File name to use in case there are any CSS dependencies that appear in multiple bundles. Defaults to "common.css".

### `include`/`exclude`

A minimatch pattern, or an array of minimatch patterns, relative to `process.cwd()`. `include` defaults to `**/*.css`.

### `json`

Boolean to determine if JSON files should be output at the end of compilation. Defaults to `false`.

### `map`

Boolean to determine if inline source maps should be included. Defaults to `true`.

To force the creation of external source maps set the value to `{ inline : false }`.

### `namedExports`

By default this plugin will create both a default export and named `export`s for each class in a CSS file. You can disable this by setting `namedExports` to `false`.

### `styleExport`

By default this plugin will extract and bundle CSS in a separate file. If you would like the styles from each imported CSS file to be exported as a string for use in JS, you can enable this by setting `styleExport` to `true`. If you are using this option the `after` & `done` hooks **will not run against the exported styles**, you should perform any additional CSS transformations in the `processing` hook instead.

```js
import { styles } from "./styles.css";
```

Enable `styleExport` will also disable the plugin from emitting any assets as well as sourcemaps (unless you explicitly opt-in to sourcemaps via the `map` option)

### Shared Options

All other options are passed to the underlying `Processor` instance, see [Options](https://github.com/tivac/modular-css/blob/master/docs/api.md#options).

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
