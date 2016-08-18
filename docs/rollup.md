# Rollup

`modular-css/rollup` provides a rollup build plugin you can use to transform imported `.css` files into lookup objects.

## Options

### `css`

Location to write the generated CSS file to.

### Shared Options

All other options are passed to the underlying `Processor` instance, see [Options](api.md#processor-options).

## API

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

## Config file

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
