# Svelte

`modular-css-svelte` provides a [svelte preprocessor](https://svelte.technology/guide#preprocessing) that can convert inline `<style>` or external `<link>` tags using `modular-css` and will also staticly replace any css references it can find for maximum speed.

### Options

All options are passed to the underlying `Processor` instance, see [Options](api.md#options).

## Usage

### `svelte.preprocess()`

```js
const filename = "./Component.html";

const { processor, preprocess } = require("modular-css-svelte")({
    css : "./dist/bundle.css"
});

const processed = await svelte.preprocess(
    fs.readFileSync(filename, "utf8"),
    Object.assign({}, preprocess, { filename })
);

const result = processor.output();

fs.writeFileSync("./dist/bundle.css", result.css);
```

### `rollup-plugin-svelte`

#### API

```js
const rollup = require("rollup").rollup;

const { preprocess, plugin } = require("modular-css-svelte/rollup")({
    css : "./dist/bundle.css"
});

const bundle = await rollup({
    input   : "./Component.html",
    plugins : [
        require("rollup-plugin-svelte")({
            preprocess
        }),
        plugin
    ]
});

// bundle.write will also write out the CSS to the path specified in the `css` arg
bundle.write({
    format : "es",
    file   : "./dist/bundle.js"
});
```

#### `rollup.config.js`

```js
const { preprocess, plugin } = require("modular-css-svelte/rollup")({
    css : "./dist/bundle.css"
});

module.exports = {
    input   : "./Component.html",
    output  : {
        format : "es",
        file   : "./dist/bundle.js"
    },
    plugins : [
        require("rollup-plugin-svelte")({
            preprocess
        }),
        plugin
    ]
};
```
