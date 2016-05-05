modular-css-namer
=================

Tiny classnames for [`modular-css`](https://github.com/tivac/modular-css) builds!

## Usage

### JS API

```js
var Processor = require("modular-css"),
    processor = new Processor({
        namer : require("modular-css-namer")()
    });
    
// ...
```

### Browserify

```js
build.plugin("modular-css/browserify", {
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
        require("modular-css/rollup")({
            css   : "./gen/index.css",
            namer : require("modular-css-namer")()
        })
    ]
}).then(function(bundle) {
    // ...
});
```
