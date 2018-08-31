@modular-css/path-resolver [![NPM Version](https://img.shields.io/npm/v/@modular-css/path-resolver.svg)](https://www.npmjs.com/package/@modular-css/path-resolver) [![NPM License](https://img.shields.io/npm/l/@modular-css/path-resolver.svg)](https://www.npmjs.com/package/@modular-css/path-resolver) [![NPM Downloads](https://img.shields.io/npm/dm/@modular-css/path-resolver.svg)](https://www.npmjs.com/package/@modular-css/path-resolver)
===========

<p align="center">
    <a href="https://gitter.im/modular-css/modular-css"><img src="https://img.shields.io/gitter/room/modular-css/modular-css.svg" alt="Gitter" /></a>
</p>

A resolver for [`modular-css`](https://github.com/tivac/modular-css) that will let you resolve file references against arbitrary paths. Useful to avoid code like

```
@value foo from "../../../../../../../../some/other/directory/file.css";
```

which is annoying to write, annoying to read, and also super-brittle.

- [Install](#install)
- [Usage](#usage)
- [Options](#options)

## Install

`$ npm i @modular-css/path-resolver`

## Usage

Pass as part of the `resolvers` array in the `modular-css` options (via JS API/Rollup/Browserify/WebPack/etc). When `modular-css` is trying to resolve `@value` or `composes` file references it'll use the default node resolution algorithm against whichever paths you specified.

```js
const Processor = require("@modular-css/processor");
const paths     = require("@modular-css/path-resolver");

const processor = new Processor({
    resolvers : [
        paths({
            paths : [
                "./path/one",
                "../../some/other/path"
            ]
        })
    ]
});
```

## Options

### `paths`

An array of string file paths, they can be relative to the `cwd` of the `Processor` instance or absolute paths.
