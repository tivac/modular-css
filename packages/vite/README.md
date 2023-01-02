# @modular-css/vite  [![NPM Version](https://img.shields.io/npm/v/@modular-css/vite.svg)](https://www.npmjs.com/package/@modular-css/vite) [![NPM License](https://img.shields.io/npm/l/@modular-css/vite.svg)](https://www.npmjs.com/package/@modular-css/vite) [![NPM Downloads](https://img.shields.io/npm/dm/@modular-css/vite.svg)](https://www.npmjs.com/package/@modular-css/vite)

Vite support for [`modular-css`](https://github.com/tivac/modular-css).

- [Install](#install)
- [Usage](#usage)
- [Options](#options)

## Install

```shell
> npm i @modular-css/vite
```

## Usage

```javascript
// vite.config.js
import mcss from "@modular-css/vite";

export default {
    plugins : [
        mcss()
    ]
};
```

## Options

### `include`/`exclude`

A minimatch pattern, or an array of minimatch patterns, relative to `process.cwd()`. `include` defaults to `**/*.css`.

### `processor`

Pass an already-instantiated `Processor` instance to the rollup plugin. It will then add any files found when traversing the modules to it and both the rollup-discovered and any already-existing files will be output in the final CSS.

#### `styleExport`

You can disable returning the style string, eg `import { styles } from "./style.css";`, by setting `styleExport` to `false`. Defaults to `true`.

#### `defaultExport`

You can disable exporting classes as default export, eg `import styles from "./style.css";`, by setting `defaultExport` to `false`. Defaults to `true`.

#### `variableDeclaration`

You can set variable declaration kind, eg `var mc_rule = ...;`, by setting `variableDeclaration` to `var`. Defaults to `const`.

### Shared Options

All other options are passed to the underlying `Processor` instance, see the [Processor Options](https://m-css.com/api/#direct-usage-js-api-processor-options).
