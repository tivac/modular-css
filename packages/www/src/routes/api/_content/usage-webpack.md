### webpack

[Webpack](https://webpack.js.org/) 2/3/4 support for modular-css is provided by `@modular-css/webpack`.

**NOTE**: `webpack@5` is untested but may be functional. If you try it out report back in [Discord](https://discord.gg/jQCZqMuMdt)!

This package contains two entry points, you will need to use **both** in tandem for things to work!

1. `@modular-css/webpack/plugin` provides a webpack plugin you can use to transform imported `.css` files into lookup objects while outputting CSS to disk.

2. `@modular-css/webpack/loader` provides the file loader that does the actual transformation on files.

#### Install

```shell
> npm i @modular-css/webpack --save-dev
```

#### Usage

```javascript
// webpack.config.js
const path = require("path");
    
const CSSPlugin = require("@modular-css/webpack/plugin");

module.exports = {
    entry   : "./input.js",
    output  : {
        path : path.resolve(__dirname, "dist"),
        filename : "./output.js"
    },
    module : {
        rules : [{
            test : /\.css$/,
            use  : "@modular-css/webpack/loader"
        }]
    },
    plugins : [
        new CSSPlugin({
            css  : "./output.css",
            json : "./output.json"
        })
    ]
});
```

#### Plugin Options

##### `dev`

Enable dev mode. In dev mode the default export of a CSS file will be a `Proxy` instead of a bare object. Attempts to access non-existant properties on the proxy will throw a `ReferenceError` to assist in catching incorrect usage.

##### `dev.warn`

Enable dev mode warnings. Will use a `Proxy` like normal dev mode, but will log warnings via `console.warn()` instead of throwing errors

##### `dev.coverage`

Enable dev mode coverage. Will use a `Proxy` like normal dev mode, and will track all reads of exported class names onto a global `mcssCoverage` object that can be inspected to look for unused styles.

##### `css`

Location to write the generated CSS file to, relative to `output.path` just like `output.filename`

##### `json`

Location to write out the JSON mapping file to, relative to `output.path` just like `output.filename`

##### `processor`

Pass an already-instantiated `Processor` instance to the Webpack plugin. It will then add any files found when traversing the modules to it and both the Webpack-discovered and any already-existing files will be output in the final CSS.

##### Shared Options

All other options are passed to the underlying `Processor` instance, see the [Processor Options](#direct-usage-js-api-processor-options)..

#### Loader Options

##### `namedExports`

By default this plugin will create both a default export and named `export`s for each class in a CSS file. You can disable this by setting `namedExports` to `false`.

```javascript
...
    module : {
        rules : [{
            test : /\.css$/,
            use  : {
                loader  : "@modular-css/webpack/loader",
                options : {
                    namedExports : false
                }
            }
        }]
    },
...
```
