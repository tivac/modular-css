### rollup

[Rollup](https://rollupjs.org) support for modular-css is provided by the `@modular-css/rollup package`.

#### Install

```shell
> npm i @modular-css/rollup --save-dev
```

#### Usage

##### API

```javascript
const bundle = await rollup({
    input   : "./index.js",
    plugins : [
        require("@modular-css/rollup")()
    ]
});
```

##### `rollup.config.js`

```javascript
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

#### Options

##### `dev`

Enable dev mode. In dev mode the default export of a CSS file will be a `Proxy` instead of a bare object. Attempts to access non-existant properties on the proxy will throw a `ReferenceError` to assist in catching incorrect usage.

##### `include`/`exclude`

A minimatch pattern, or an array of minimatch patterns, relative to `process.cwd()`. `include` defaults to `**/*.css`.

##### `json`

Boolean/String to determine if JSON files containing all exported classes & values should be output. If set to `true` will write out to a file named `exports.json`. If a `String` will write out to that file name. Defaults to `false`.

##### `map`

Boolean to determine if inline source maps should be included. Defaults to `true`.

To force the creation of external source maps set the value to `{ inline : false }`.

##### `meta`

Boolean/String to determine if chunk metadata should be output. If set to true will write out a file named `metadata.json`. If a `String` will write out to that file name. Defaults to `false`.

Currently the only metadata being written is CSS dependencies, but that may change in the future.

##### `namedExports`

By default this plugin will create both a default export and named `export`s for each class in a CSS file. You can disable this by setting `namedExports` to `false`.

##### `styleExport`

By default this plugin will extract and bundle CSS in a separate file. If you would like the styles from each imported CSS file to be exported as a string for use in JS, you can enable this by setting `styleExport` to `true`. If you are using this option the `after` & `done` hooks **will not run against the exported styles**, you should perform any additional CSS transformations in the `processing` hook instead.

```javascript
import { styles } from "./styles.css";
```

Enable `styleExport` will also disable the plugin from emitting any assets as well as sourcemaps (unless you explicitly opt-in to sourcemaps via the `map` option)

##### `processor`

Pass an already-instantiated `Processor` instance to the rollup plugin. It will then add any files found when traversing the modules to it and both the rollup-discovered and any already-existing files will be output in the final CSS.

##### `empties`

Set to a falsey value to disable outputting of empty CSS files. This is most common when a file contains only `@value`s and then a minifier is used which strips out the file heading comments. Defaults to `true`.

##### Shared Options

All other options are passed to the underlying `Processor` instance, see the [Processor Options](#processor-options).
