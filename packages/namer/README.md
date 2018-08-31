@modular-css/shortnames [![NPM Version](https://img.shields.io/npm/v/@modular-css/shortnames.svg)](https://www.npmjs.com/package/@modular-css/shortnames) [![NPM License](https://img.shields.io/npm/l/@modular-css/shortnames.svg)](https://www.npmjs.com/package/@modular-css/shortnames) [![NPM Downloads](https://img.shields.io/npm/dm/@modular-css/shortnames.svg)](https://www.npmjs.com/package/@modular-css/shortnames)
=================

<p align="center">
    <a href="https://gitter.im/modular-css/modular-css"><img src="https://img.shields.io/gitter/room/modular-css/modular-css.svg" alt="Gitter" /></a>
</p>

Tiny classnames for [`modular-css`](https://github.com/tivac/modular-css) production builds!

- [Install](#install)
- [Usage](#usage)

## Install

```bash
> npm install @modular-css/shortnames
```

## Usage

### JS API

```js
const Processor = require("@modular-css/processor");
const processor = new Processor({
    namer : require("@modular-css/shortnames")()
});
    
// ...
```

### Browserify

```js
build.plugin("@modular-css/browserify", {
    css   : "./style.css",
    namer : require("@modular-css/shortnames")()
});

// ...
```

### Rollup

```js
rollup({
    entry   : "./index.js",
    plugins : [
        require("@modular-css/rollup")({
            css   : "./gen/index.css",
            namer : require("@modular-css/shortnames")()
        })
    ]
});
```

## Example output

```css
/* one.css */
.alert {}
.notification {}

/* two.css */
.title {}
.heading .subheading {}
```

becomes

```css
/* output.css */
.AA {}
.AB {}

.BA {}
.BB .BC {}
```
