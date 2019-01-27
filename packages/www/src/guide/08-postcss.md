## postcss

PostCSS plugin to use [`modular-css`](https://github.com/tivac/modular-css) within a PostCSS processor instance.

- [Install](#install)
- [Usage](#usage)
- [Options](#options)

### Install

```bash
> npm i @modular-css/postcss
```

### Usage

`@modular-css/postcss` provides a PostCSS plugin that can be used like any other. It will output a message with a `type` of `modular-css-exports` containing all the exported class compositions.

#### API

```js
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

#### Config

```bash
> postcss --config postcss.json input.css
```

```json
{
    "output" : "out.css",
    
    "@modular-css/postcss": {
        "json" : "./path/to/output.json"
    }
}

```

#### CLI

```bash
> postcss --use modular-css/postcss input.css
```

### Options

#### `json`

Write the class composition data to this location on disk.

#### Shared Options

All other options are passed to the underlying `Processor` instance, see [Options](../processor/README.md#options).
