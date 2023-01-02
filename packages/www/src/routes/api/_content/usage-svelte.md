### svelte preprocessor

Svelte preprocessor support for [`modular-css`](https://github.com/tivac/modular-css).

Process inline `<style type="text/m-css">` or `<link>` or `import styles from "./foo.css";` references inside your Svelte components using the full power of `modular-css`. Dynamic references will be replaced where possible with static ones, allowing for greater compile-time optimizations, smaller bundles, and even faster runtime performance.

#### Example

##### `<style>` processing

Turns this

```html
<div class="{css.main}">
    <h1 class="{css.title}">Title</h1>
</div>

<!-- type attribute is **required** -->
<style type="text/m-css">
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

##### `<link>` processing

You can also use `<link href="./file.css" />` tags to reference CSS external to the component, but the component must have only **one** `<link>` (links to URLs are fine and ignored) or `<style>`. Combining them is not supported.

```html
<link href="./style.css" />

<div class="{css.main}">
    <h1 class="{css.title}">Title</h1>
</div>
```

##### `import` processing

It'll even check your ES Module `import` statements and use those.

```html
<div class="{styles.main}">
    <h1 class="{styles.title}">Title</h1>
</div>

<script>
// Only default exports are supported, but it will use the name you
// give it instead of the hardcoded css like the other approaches
import styles from "./style.css";
</script>
```

#### Install

```shell
> npm i @modular-css/svelte -D
```

#### Usage

You can use the svelte preprocessor in almost every environment where you're using svelte. Here are a few examples of common usage to help get you started.

##### via `svelte.preprocess()`

```javascript
const filename = "./Component.svelte";

const { processor, preprocess } = require("@modular-css/svelte")({
    // Processor options
    // ...
});

const processed = await svelte.preprocess(
    fs.readFileSync(filename, "utf8"),
    { ...preprocess, filename },
);

const result = await processor.output();

fs.writeFileSync("./dist/bundle.css", result.css);
```

##### via `rollup`

```javascript
// rollup.config.js
const { preprocess, processor } = require("@modular-css/svelte")({
    // Processor options
    // ...
});

module.exports = {
    input   : "./Component.svelte",
    
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
        }),
    ]
};
```

##### via `vite`

```javascript
// vite.config.js
import { defineConfig } from "vite";
import preprocessor from "@modular-css/svelte";
import mcssVite from "@modular-css/vite";

// Set up the svelte preprocessor and get a reference to the
// mcss processor so we can pass it into the vite plugin
const { preprocess, processor } = preprocessor({
    // Default is .css but we need .mcss because of vite
    include : /\.mcss$/i,

    // Other processor options
    // ...
});

export default defineConfig({
    plugins : [
        mcssVite({
            processor,
        }),
    ],
});
```

#### Options

##### `strict`

If `true` whenever a missing replacement is found like `{css.doesnotexist}` an error will be thrown aborting the file processing. Defaults to `false`.

##### `procesor`

Pass a previously-created `@modular-css/processor` instance into the preprocessor. Will **not** pass through any other options to the processor if this is set, but `strict` will still be honored by the preprocessor.

##### Shared Options

All options are passed to the underlying `Processor` instance, see the [Processor Options](#direct-usage-js-api-processor-options).
