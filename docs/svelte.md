# Svelte

`@modular-css/svelte` provides a [svelte preprocessor](https://svelte.technology/guide#preprocessing) that can convert inline `<style>` or external `<link>` tags using `modular-css` and will also staticly replace any css references it can find for maximum speed.

### Options

All options are passed to the underlying `Processor` instance, see [Options](api.md#options).

## Usage

### `svelte.preprocess()`

```js
const filename = "./Component.html";

const { processor, preprocess } = require("@modular-css/svelte")({
    // Processor options
});

const processed = await svelte.preprocess(
    fs.readFileSync(filename, "utf8"),
    Object.assign({}, preprocess, { filename })
);

const result = processor.output();

fs.writeFileSync("./dist/bundle.css", result.css);
```

### `@modular-css/rollup`

#### API

```js
const rollup = require("rollup").rollup;

const { preprocess, processor } = require("@modular-css/svelte")({
    // Processor options
});

const bundle = await rollup({
    input   : "./Component.html",

    plugins : [
        require("rollup-plugin-svelte")({
            preprocess,
        }),

        require("@modular-css/rollup")({
            processor,

            common : "common.css",
        }),
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
const { preprocess, processor } = require("@modular-css/svelte")({
    // Processor options
});

module.exports = {
    input   : "./Component.html",

    output  : {
        format : "es",
        file   : "./dist/bundle.js"
    },

    plugins : [
        require("rollup-plugin-svelte")({
            preprocess,
        }),

        require("@modular-css/rollup")({
            processor,

            common : "common.css",
        }),
    ]
};
```

## Options

### `strict`

If `true` whenever a missing replacement is found like `{css.doesnotexist}` an error will be throw aborting the file processing. Defaults to `false`.

### Shared Options

All options are passed to the underlying `Processor` instance, see [Options](https://github.com/tivac/modular-css/blob/master/docs/api.md#options).
