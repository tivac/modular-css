# @modular-css/rollup  [![NPM Version](https://img.shields.io/npm/v/@modular-css/rollup.svg)](https://www.npmjs.com/package/@modular-css/rollup) [![NPM License](https://img.shields.io/npm/l/@modular-css/rollup.svg)](https://www.npmjs.com/package/@modular-css/rollup) [![NPM Downloads](https://img.shields.io/npm/dm/@modular-css/rollup.svg)](https://www.npmjs.com/package/@modular-css/rollup)

Rollup support for [`modular-css`](https://github.com/tivac/modular-css).

- [Install](#install)
- [Rollup Version support](#%EF%B8%8Frollup-version-support%EF%B8%8F)
- [Usage](#usage)
  - [API](#api)
  - [Config file](#config-file)
  - [In your code](#in-your-code)
- [Options](#options)

## Install

```bash
> npm i @modular-css/rollup
```

## ⚠️Rollup Version support⚠️

Due to API changes, certain major versions of this plugin will require a specific minimum rollup version. This is expressed within the `peerDependency` field in `package.json` and replicated here for ease of reference.

- `@modular-css/rollup@19` requires `rollup@1.0.0`
- `@modular-css/rollup@18` requires `rollup@0.68.0`
- `@modular-css/rollup@15` requires `rollup@0.65.0`
- `@modular-css/rollup@11` requires `rollup@0.60.0`

## Usage

### API

```js
const bundle = await rollup({
    input   : "./index.js",
    plugins : [
        require("@modular-css/rollup")()
    ]
});
```

### Config file

```js
import css from "@modular-css/rollup";

export default {
    input   : "./index.js",
    output  : {
        dest    : "./gen/bundle.js",
        format  : "umd"
    },
    plugins : [
        css()
    ]
};
```

### In your code

Write your modular-css styles in a `.css` file

```css
/* style.css */
@value error: red;

.rule {
    border: 1px solid error;
}
```

import it from your JS, either as named exports

```js
// Named exports
import { rule, $values } from "./style.css";

console.log(rule); // .mc_abcdefrule
console.log($values); // { error : "red" }
```

or using the default export

```js
// Default export
import css from "./style.css";

console.log(css.rule); // .mc_abcdefrule
console.log(css.$values); // { error : "red" }
```

## Options

### `common`

File name to use in case there are any CSS dependencies that appear in multiple bundles. Defaults to "common.css".

### `dev`

Enable dev mode. In dev mode the default export of a CSS file will be a `Proxy` instead of a bare object. Attempts to access non-existant properties on the proxy will throw a `ReferenceError` to assist in catching missing class references.

### `include`/`exclude`

A minimatch pattern, or an array of minimatch patterns, relative to `process.cwd()`. `include` defaults to `**/*.css`.

### `json`

Boolean/String to determine if JSON files containing all exported classes & values should be output. If set to `true` will write out to a file named `exports.json`. If a `String` will write out to that file name. Defaults to `false`.

### `map`

Boolean to determine if inline source maps should be included. Defaults to `true`.

To force the creation of external source maps set the value to `{ inline : false }`.

### `meta`

Boolean/String to determine if chunk metadata should be output. If set to true will write out a file named `metadata.json`. If a `String` will write out to that file name. Defaults to `false`.

Currently the only metadata being written is CSS dependencies, but that may change in the future.

#### `namedExports.rewriteInvalid`

The rollup plugin will rewrite invalid identifiers using [`identifierfy`](https://github.com/novemberborn/identifierfy) by default. You can disable this behavior by setting `namedExports` to `{ rewriteInvalid : false }`.

### `styleExport`

By default this plugin will extract and bundle CSS in a separate file. If you would like the styles from each imported CSS file to be exported as a string for use in JS, you can enable this by setting `styleExport` to `true`. If you are using this option the `after` & `done` hooks **will not run against the exported styles**, you should perform any additional CSS transformations in the `processing` hook instead.

```js
import { styles } from "./styles.css";
```

Enable `styleExport` will also disable the plugin from emitting any assets as well as sourcemaps (unless you explicitly opt-in to sourcemaps via the `map` option)

### `empties`

Set to `true` to enable writing out CSS files that don't contain any content (like if you have a CSS file that contains only `@value` rules).

### `processor`

Pass an already-instantiated `Processor` instance to the rollup plugin. It will then add any files found when traversing the modules to it and both the rollup-discovered and any already-existing files will be output in the final CSS.

### `verbose`

Enable verbose logging while running to help diagnose issues

### Shared Options

All other options are passed to the underlying `Processor` instance, see [Options](../processor/README.md#options).
