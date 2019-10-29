@modular-css/webpack  [![NPM Version](https://img.shields.io/npm/v/@modular-css/webpack.svg)](https://www.npmjs.com/package/@modular-css/webpack) [![NPM License](https://img.shields.io/npm/l/@modular-css/webpack.svg)](https://www.npmjs.com/package/@modular-css/webpack) [![NPM Downloads](https://img.shields.io/npm/dm/@modular-css/webpack.svg)](https://www.npmjs.com/package/@modular-css/webpack)
===========

<p align="center">
    <a href="https://gitter.im/modular-css/modular-css"><img src="https://img.shields.io/gitter/room/modular-css/modular-css.svg" alt="Gitter" /></a>
</p>

Webpack 2/3/4 support for [`modular-css`](https://github.com/tivac/modular-css).

This package contains two entry points, you will need to use **both** in tandem for things to work!

1. `@modular-css/webpack/plugin` provides a webpack plugin you can use to transform imported `.css` files into lookup objects while outputting CSS to disk.

2. `@modular-css/webpack/loader` provides the file loader that does the actual transformation on files.

- [Install](#install)
- [Usage](#usage)
- [Options](#options)

## Install

```bash
> npm i @modular-css/webpack
```

## Usage

```js
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

## Options

### Plugin Options

#### `css`

Location to write the generated CSS file to, relative to `output.path` just like `output.filename`

#### `json`

Location to write out the JSON mapping file to, relative to `output.path` just like `output.filename`

#### `processor`

Pass an already-instantiated `Processor` instance to the Webpack plugin. It will then add any files found when traversing the modules to it and both the Webpack-discovered and any already-existing files will be output in the final CSS.

#### Shared Options

All other options are passed to the underlying `Processor` instance, see [Options](../processor/README.md#options).

### Loader Options

#### `defaultExport`

By default this plugin will create both a default export and named `export`s for each class in a CSS file. You can disable `default` by setting `defaultExport` to `false`.

```js
...
    module : {
        rules : [{
            test : /\.css$/,
            use  : {
                loader  : "@modular-css/webpack/loader",
                options : {
                    defaultExport : false
                }
            }
        }]
    },
...
```

#### `namedExports`

By default this plugin will create both a default export and named `export`s for each class in a CSS file. You can disable named `export`s  by setting `namedExports` to `false`.

```js
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

#### `styleExport`

By default this plugin will export the style string, eg `import { styles } from "./style.css";`. You can disable this by setting `styleExport` to `false`.

```js
...
    module : {
        rules : [{
            test : /\.css$/,
            use  : {
                loader  : "@modular-css/webpack/loader",
                options : {
                    styleExport : false
                }
            }
        }]
    },
...
```