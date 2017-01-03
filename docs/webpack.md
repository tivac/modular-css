# Webpack 2

`modular-css/webpack` provides a webpack 2 plugin you can use to transform imported `.css` files into lookup objects.

## Options

### `css`

Location to write the generated CSS file to.

### `json`

Location to write out the JSON mapping file for use in server rendering.

### Shared Options

All other options are passed to the underlying `Processor` instance, see [Options](api.md#processor-options).

## Usage

```js
// webpack.config.js
var path = require("path"),
    
    CSSPlugin = require("modular-css/webpack"),
    cssplugin = new CSSPlugin({
        css : path.resolve(__dirname, "dist/output.css")
    });

module.exports = {
    entry   : "./input.js",
    output  : {
        path : path.resolve(__dirname, "dist"),
        filename : "./output.js"
    },
    module : {
        rules : [
            cssplugin.rule({
                test : /\.css$/
            })
        ]
    },
    plugins : [
        cssplugin
    ]
});
```
