# PostCSS

`modular-css` provides a PostCSS plugin that can be used like any other. It will output a message with a `type` of `modular-css-exports` containing all the exported class compositions.

## Options

### `json`

Write the class composition data to this location on disk.

### Shared Options

All other options are passed to the underlying `Processor` instance, see [Options](api.md#processor-options).

## CLI

```
$ postcss --use modular-css/postcss input.css
```

## API

```js
var postcss   = require("postcss"),
    processor = postcss([
        require("modular-css/postcss")({
            json : "./path/to/output.json"
        })
    ]);

processor.process("<css>")
    .then((result) => {
        // result.css
        // result.map
        // result.messages.find((msg) => msg.type === "modular-css-exports")
        // etc
    });
```

## Config

```
$ postcss --config postcss.json input.css
```

```json
{
    "output" : "out.css",
    
    "modular-css/postcss": {
        "json" : "./path/to/output.json"
    }
}
```
