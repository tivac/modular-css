# @modular-css/rollup-rewriter  [![NPM Version](https://img.shields.io/npm/v/@modular-css/rollup-rewriter.svg)](https://www.npmjs.com/package/@modular-css/rollup-rewriter) [![NPM License](https://img.shields.io/npm/l/@modular-css/rollup-rewriter.svg)](https://www.npmjs.com/package/@modular-css/rollup-rewriter) [![NPM Downloads](https://img.shields.io/npm/dm/@modular-css/rollup-rewriter.svg)](https://www.npmjs.com/package/@modular-css/rollup-rewriter)

<p align="center">
    <a href="https://gitter.im/modular-css/modular-css"><img src="https://img.shields.io/gitter/room/modular-css/modular-css.svg" alt="Gitter" /></a>
</p>

Rewrite dynamic imports so they automatically load their CSS dependencies using JS chunk -> CSS chunk dependency information from [`modular-css`](https://github.com/tivac/modular-css).

- [Install](#install)
- [Usage](#usage)
- [Options](#options)

## Install

```bash
> npm i @modular-css/rollup-rewriter
```

## Usage

### API

**TBD**

### Config file

**TBD**

## Options

### `loader` (string)

The `loader` option can be set if you want the plugin to inject a reference to a CSS loader that returns a promise (I like [`lazyload-css`](https://npmjs.com/lazyload-css)). This loader must be available statically, so this option is most useful in `es`/`esm` mode where it can be loaded via `import`.

### `loadfn` (string)

The name of the promise-returning function that will be used to load CSS. The function will be passed the path to the CSS file and is expected to return a promise that resolves once the file is loaded.

The `loadfn` option is **required**.

### `verbose` (boolean)

When enabled will cause the plugin to output more information about the processing as it occurs.
