modular-css-namer [![NPM Version](https://img.shields.io/npm/v/modular-css-namer.svg)](https://www.npmjs.com/package/modular-css-namer) [![NPM License](https://img.shields.io/npm/l/modular-css-namer.svg)](https://www.npmjs.com/package/modular-css-namer) [![NPM Downloads](https://img.shields.io/npm/dm/modular-css-namer.svg)](https://www.npmjs.com/package/modular-css-namer)
=================

Tiny classnames for [`modular-css`](https://github.com/tivac/modular-css) production builds!

## Usage

### JS API

```js
var Processor = require("modular-css-core"),
    processor = new Processor({
        namer : require("modular-css-namer")()
    });
    
// ...
```

### Browserify

```js
build.plugin("modular-cssify", {
    css   : "./style.css",
    namer : require("modular-css-namer")()
});

// ...
```

### Rollup

```js
rollup({
    entry   : "./index.js",
    plugins : [
        require("modular-css-rollup")({
            css   : "./gen/index.css",
            namer : require("modular-css-namer")()
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
