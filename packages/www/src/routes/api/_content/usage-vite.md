### vite

[Vite](https://vitejs.dev) support for modular-css is provided by `@modular-css/vite`.

**NOTE**: To work around vite's built-in CSS handling you will need to use a file extension other than `.css` for modular-css files. The default for this plugin is `.mcss`, but you can use [`include`](#bundlers-vite-options-includeexclude) to change that.

#### Install

```shell
> npm i @modular-css/vite --save-dev
```

#### Usage

```javascript
// vite.config.js
import mcss from "@modular-css/vite";

export default {
    plugins : [
        mcss()
    ]
};
```

#### Options

##### `dev`

Enable dev mode. In dev mode the default export of a CSS file will be a `Proxy` instead of a bare object. Attempts to access non-existant properties on the proxy will throw a `ReferenceError` to assist in catching incorrect usage.

##### `dev.warn`

Enable dev mode warnings. Will use a `Proxy` like normal dev mode, but will log warnings via `console.warn()` instead of throwing errors

##### `dev.coverage`

Enable dev mode coverage. Will use a `Proxy` like normal dev mode, and will track all reads of exported class names onto a global `mcssCoverage` object that can be inspected to look for unused styles.

##### `include`/`exclude`

A minimatch pattern, or an array of minimatch patterns, relative to `process.cwd()`. `include` defaults to `**/*.mcss`.

##### `processor`

Pass an already-instantiated `Processor` instance to the rollup plugin. It will then add any files found when traversing the modules to it and both the rollup-discovered and any already-existing files will be output in the final CSS.

##### Shared Options

All other options are passed to the underlying `Processor` instance, see the [Processor Options](#direct-usage-js-api-processor-options).
