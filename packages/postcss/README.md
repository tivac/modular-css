postcss-modular-css [![NPM Version](https://img.shields.io/npm/v/postcss-modular-css.svg)](https://www.npmjs.com/package/postcss-modular-css) [![Build Status](https://img.shields.io/travis/tivac/modular-css/master.svg)](https://travis-ci.org/tivac/modular-css)
===========
<p align="center">
    <a href="https://www.npmjs.com/package/postcss-modular-css" alt="NPM License"><img src="https://img.shields.io/npm/l/postcss-modular-css.svg" /></a>
    <a href="https://www.npmjs.com/package/postcss-modular-css" alt="NPM Downloads"><img src="https://img.shields.io/npm/dm/postcss-modular-css.svg" /></a>
    <a href="https://david-dm.org/tivac/postcss-modular-css" alt="Dependency Status"><img src="https://img.shields.io/david/tivac/postcss-modular-css.svg" /></a>
    <a href="https://david-dm.org/tivac/postcss-modular-css#info=devDependencies" alt="devDependency Status"><img src="https://img.shields.io/david/dev/tivac/postcss-modular-css.svg" /></a>
</p>

Use `modular-css` as a PostCSS plugin.

## Install

`$ npm i postcss-modular-css`

## Usage

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
        require("postcss-modular-css")({
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
    
    "postcss-modular-css": {
        "json" : "./path/to/output.json"
    }
}
```
