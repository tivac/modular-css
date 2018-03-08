# Webpack 2/3/4

`modular-css/webpack/plugin` provides a webpack 2/3/4 plugin you can use to transform imported `.css` files into lookup objects while outputting CSS to disk.

`modular-css/webpack/loader` provides the file loader that does the actual transformation on files.

You will need to use **both** in tandem for things to work!

## Usage

```js
// webpack.config.js
var path = require("path"),
    
    CSSPlugin = require("modular-css-webpack/plugin");

module.exports = {
    entry   : "./input.js",
    output  : {
        path : path.resolve(__dirname, "dist"),
        filename : "./output.js"
    },
    module : {
        rules : [
            {
                test : /\.css$/,
                use  : "modular-css-webpack/loader"
            },

            // Or with loader options
            {
                test : /\.css$/,
                use : {
                    loader  : "modular-css-webpack/loader",
                    options : {
                        namedExports : false
                    }
                }
            }
        ]
    },
    plugins : [
        new CSSPlugin({
            css  : "./output.css",
            json : "./output.json"
        })
    ]
});
```

## Plugin Options

### `css`

Location to write the generated CSS file to, relative to `output.path` just like `output.filename`

### `json`

Location to write out the JSON mapping file to, relative to `output.path` just like `output.filename`

### Shared Options

All other options are passed to the underlying `Processor` instance, see [Options](api.md#options).

## Loader Options

### `namedExports`

Set to `false` to disable named exports, instead only the default export will be used. This is useful to avoid warnings when your classes aren't valid JS identifiers.
