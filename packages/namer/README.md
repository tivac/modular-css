modular-css-namer [![NPM Version](https://img.shields.io/npm/v/modular-css-namer.svg)](https://www.npmjs.com/package/modular-css-namer) [![NPM License](https://img.shields.io/npm/l/modular-css-namer.svg)](https://www.npmjs.com/package/modular-css-namer) [![NPM Downloads](https://img.shields.io/npm/dm/modular-css-namer.svg)](https://www.npmjs.com/package/modular-css-namer) [![Build Status](https://img.shields.io/travis/tivac/modular-css/master.svg)](https://travis-ci.org/tivac/modular-css)
=================

Tiny classnames for [`modular-css`](https://github.com/tivac/modular-css) builds!

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
})
.then(function(bundle) {
    // ...
});
```
