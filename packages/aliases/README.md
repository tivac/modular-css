@modular-css/path-aliases [![NPM Version](https://img.shields.io/npm/v/@modular-css/path-aliases.svg)](https://www.npmjs.com/package/@modular-css/path-aliases) [![NPM License](https://img.shields.io/npm/l/@modular-css/path-aliases.svg)](https://www.npmjs.com/package/@modular-css/path-aliases) [![NPM Downloads](https://img.shields.io/npm/dm/@modular-css/path-aliases.svg)](https://www.npmjs.com/package/@modular-css/path-aliases)
===========

A resolver for [`modular-css`](https://github.com/tivac/modular-css) that will let you resolve file references against named aliases. Useful to avoid code like

```
@value foo from "../../../../../../../../some/other/directory/file.css";
```

which is annoying to write, annoying to read, and also super-brittle.

## Install

`$ npm i @modular-css/path-aliases`

## Usage

Pass as part of the `resolvers` array in the `modular-css` options (via JS API/Vite/Rollup/etc). When `modular-css` is trying to resolve `@value` or `composes` file references it'll replace the alias keys with their path value for file lookups.

```js
const Processor = require("@modular-css/processor");
const aliases = require("@modular-css/path-aliases");

const processor = new Processor({
    resolvers : [
        aliases({
            aliases : {
                one  : "./path/one",
                path : "../../some/other/path"
            }
        })
    ]
});
```

which allows you to write CSS like this.

```css
@value one from "one/one.css";

.a {
    composes: path from "path/path.css";
}
```

### Options

#### `aliases`

A `object` consisting of key/value pairs of alias names to file paths. Paths can be relative to the `cwd` of the `Processor` instance or absolute paths.
