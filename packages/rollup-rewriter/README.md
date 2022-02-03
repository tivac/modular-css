# @modular-css/rollup-rewriter  [![NPM Version](https://img.shields.io/npm/v/@modular-css/rollup-rewriter.svg)](https://www.npmjs.com/package/@modular-css/rollup-rewriter) [![NPM License](https://img.shields.io/npm/l/@modular-css/rollup-rewriter.svg)](https://www.npmjs.com/package/@modular-css/rollup-rewriter) [![NPM Downloads](https://img.shields.io/npm/dm/@modular-css/rollup-rewriter.svg)](https://www.npmjs.com/package/@modular-css/rollup-rewriter)

Rewrite dynamic imports so they automatically load their CSS dependencies using JS chunk -> CSS chunk dependency information from [`modular-css`](https://github.com/tivac/modular-css). Avoid the dreaded [FOUC](https://en.wikipedia.org/wiki/Flash_of_unstyled_content) automatically without having to manually juggle CSS files & JS chunks.

Turn this:

```js
const module = await import("./expensive-styled-module.js");
```

into this

```js
const module = await Promise.all([
    lazyload("./expensive-styled-module.css"),
    import("./expensive-styled-module.js")
])
.then((result) => result[result.length - 1]);
```

- [Install](#install)
- [Limitations](#-limitations-)
- [Usage](#usage)
- [Options](#options)

## Install

```bash
> npm i @modular-css/rollup-rewriter
```

## ⚠ Limitations ⚠

This plugin does not yet do everything for you instantly and perfectly. Maybe someday! Here's a list of current limitations:

- Only supports some of the rollup output [`format`](https://rollupjs.org/guide/en#output-format) values.
    - Currently `es`, `esm`, `amd`, and `system`.
- Doesn't dynamically add the `loader` option into the module so it can be inlined or extracted by rollup.
    - It's just injected at the top of the module scope, so you can't depend on packaging yet. Can't be injected earlier because the full module dependency tree & chunks must be known first.
    - Probably easier to ensure it's available globally and only use `loadfn`.
- Doesn't allow for adjusting URLs to add a CDN-prefix or anything else.
    - This would be straightforward, just not implemented yet. A PR would be very welcome!

## Usage

### API

```js
const bundle = await rollup({
    input   : "./index.js",
    plugins : [
        require("@modular-css/rollup")(),
        require("@modular-css/rollup-rewriter")({
            loadfn : "...",
        }),
    ],
});
```

### Config file

```js
import css from "@modular-css/rollup";
import rewrite from "@modular-css/rollup-rewriter";

export default {
    input   : "./index.js",
    output  : {
        dest    : "./gen/bundle.js",
        format  : "umd"
    },
    plugins : [
        css(),
        rewrite({
            loadfn : "...",
        }),
    ],
};
```

## Options

### `loader` (string|function)

The `loader` option can be set if you want the plugin to inject a reference to a CSS loader that returns a promise (I like [`lazyload-css`](https://npmjs.com/lazyload-css)). This loader must be available statically, so this option is most useful in `es`/`esm` mode where it can be loaded via `import`. If given a function instead of a string that function will be called once per chunk being modified, it gets passed a single argument of the form `{ chunks }` where `chunks` is the raw rollup output chunks.

### `loadfn` (string)

The name of the promise-returning function that will be used to load CSS. The function will be passed the path to the CSS file and is expected to return a promise that resolves once the file is loaded.

The `loadfn` option is **required**.

### `verbose` (boolean)

When enabled will cause the plugin to output more information about the processing as it occurs.
