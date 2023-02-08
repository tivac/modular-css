@modular-css/namers [![NPM Version](https://img.shields.io/npm/v/@modular-css/namers.svg)](https://www.npmjs.com/package/@modular-css/namers) [![NPM License](https://img.shields.io/npm/l/@modular-css/namers.svg)](https://www.npmjs.com/package/@modular-css/namers) [![NPM Downloads](https://img.shields.io/npm/dm/@modular-css/namers.svg)](https://www.npmjs.com/package/@modular-css/namers)
=================

Tiny classnames for [`modular-css`](https://github.com/tivac/modular-css) production builds!

- [Install](#install)
- [Usage](#usage)

## Install

```bash
> npm install @modular-css/namers
```

#### Usage

##### JS API

```js
const Processor = require("@modular-css/processor");
const { short } = require("@modular-css/namers");

const namer = short();

const processor = new Processor({
    namer,
});
    
// ...
```

##### Rollup

```js
const { short } = require("@modular-css/namers");

const namer = short();

rollup({
    entry   : "./index.js",
    plugins : [
        require("@modular-css/rollup")({
            css : "./gen/index.css",
            namer,
        })
    ]
});
```

#### Example output

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
