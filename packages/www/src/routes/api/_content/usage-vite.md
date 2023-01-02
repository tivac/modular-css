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

##### `include`/`exclude`

A minimatch pattern, or an array of minimatch patterns, relative to `process.cwd()`. `include` defaults to `**/*.mcss`.

##### `processor`

Pass an already-instantiated `Processor` instance to the rollup plugin. It will then add any files found when traversing the modules to it and both the rollup-discovered and any already-existing files will be output in the final CSS.

##### Shared Options

All other options are passed to the underlying `Processor` instance, see the [Processor Options](#direct-usage-js-api-processor-options).
