### svelte

Svelte preprocessor support for [`modular-css`](https://github.com/tivac/modular-css). Process inline `<style>` or `<link>` references inside your Svelte components using the full power of `modular-css` while also providing compile-time optimizations for smaller bundles and even faster runtime performance!

#### Example

Turns this

```html
<div class="{css.main}">
    <h1 class="{css.title}">Title</h1>
</div>

<style>
    .main {
        /* ... */
    }
    
    .title {
        /* ... */
    }
</style>
```

into this by running it through `modular-css` and then statically replacing everything possible for zero-cost run-time styling.

```html
<div class="abc123_main">
    <h1 class="abc123_title">Title</h1>
</div>
```

You could also use `<link href="./file.css" />` tags to reference CSS external to the component, but the component must have only **one** `<link>` (links to URLs are fine and ignored) or `<style>`. Combining them is not supported.

#### Install

```bash
> npm i @modular-css/svelte -D
```

#### Usage

##### `svelte.preprocess()`

```js
const filename = "./Component.html";

const { processor, preprocess } = require("@modular-css/svelte")({
    // Processor options
});

const processed = await svelte.preprocess(
    fs.readFileSync(filename, "utf8"),
    Object.assign({}, preprocess, { filename })
);

const result = await processor.output();

fs.writeFileSync("./dist/bundle.css", result.css);
```

##### `@modular-css/rollup`

###### API

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

###### `rollup.config.js`

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

#### Options

##### `strict`

If `true` whenever a missing replacement is found like `{css.doesnotexist}` an error will be thrown aborting the file processing. Defaults to `false`.

##### `procesor`

Pass a previously-created `@modular-css/processor` instance into the preprocessor. Will **not** pass through any other options to the processor if this is set, but `strict` will still be honored by the preprocessor.

##### Shared Options

All options are passed to the underlying `Processor` instance, see the [Processor Options](#processor-options).
