# Webpack 2

`modular-css/webpack/plugin` provides a webpack 2 plugin you can use to transform imported `.css` files into lookup objects while outputting CSS to disk.

`modular-css/webpack/loader` provides the file loader that does the actual transformation on files.

You will need to use **both** in tandem for things to work!

## Options

### `css`

Location to write the generated CSS file to, relative to `output.path` just like `output.filename`

### `json`

Location to write out the JSON mapping file to, relative to `output.path` just like `output.filename`

### Shared Options

All other options are passed to the underlying `Processor` instance, see [Options](api.md#processor-options).

## Usage

```js
// webpack.config.js
var path = require("path"),
    
    CSSPlugin = require("modular-css/webpack/plugin");

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
                use  : "modular-css/webpack/loader"
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
