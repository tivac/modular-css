### Namer

Tiny classnames for production builds via the `short()` export, and longer names for dev via `long()`!

#### Install

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
