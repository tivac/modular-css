### Namer

Tiny classnames for [`modular-css`](https://github.com/tivac/modular-css) production builds!

#### Install

```bash
> npm install @modular-css/shortnames
```

#### Usage

##### JS API

```js
const Processor = require("@modular-css/processor");
const processor = new Processor({
    namer : require("@modular-css/shortnames")()
});
    
// ...
```

##### Rollup

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
