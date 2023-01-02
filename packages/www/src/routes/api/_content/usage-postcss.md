### postcss

`@modular-css/postcss` provides a postcss plugin that can be used like any other. It will output a message with a `type` of `modular-css-exports` containing all the exported class compositions.

#### Install

```shell
> npm i @modular-css/postcss
```

#### Usage

##### API

```javascript
const postcss = require("postcss");
const processor = postcss([
    require("@modular-css/postcss")({
        json : "./path/to/output.json"
    })
]);

const result = await processor.process("<css>")

// result.css
// result.map
// result.messages.find((msg) => msg.type === "modular-css-exports")
// etc
```

##### config

```shell
> postcss --config postcss.json input.css
```

```javascript
{
    "output" : "out.css",
    
    "@modular-css/postcss": {
        "json" : "./path/to/output.json"
    }
}

```

##### CLI

```shell
> postcss --use @modular-css/postcss input.css
```

#### Options

##### `json`

Write the class composition data to this location on disk.

##### Shared Options

All other options are passed to the underlying `Processor` instance, see [Processor Options](#direct-usage-js-api-processor-options).
