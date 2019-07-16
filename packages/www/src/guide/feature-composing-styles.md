### Style Composition

Selector limitations mean that it's difficult to use complicated selectors, so to enable building anything of complexity you can compose selectors. These compositions can be within a file or even pull in classes defined in other files.

```css
/* == styles.css == */
.single {
    composes: other from "./other.css";
    color: red;
}

/* Will be stripped from the CSS output because it doesn't */
/* contain any actual rules */
.multiple {
    composes: more, than, one from "./multiple.css";
}

.local {
    composes: single;
}
```

[REPL Link](https://m-css.com/repl/#NrBEHoFsEMEsDs)

When this file is required the JS object will contain the expected keys, but the arrays will now contain more values.

```js
var css = require("./styles.css");

// css is:
/*
{
    single   : "dafdfcc_other aeacf0c_single",
    // Since .multiple is only a singular composes: declaration there's no need
    // for it to be rewritten, it's left out of the output
    multiple : "dafdfcc_more f5507abd_than aeacf0c_one",
    local    : "dafdfcc_other aeacf0c_single"
}
*/
```

If you're going to be doing a lot of composition with another file you can store the filename into a value for ease of referencing.

```css
@value guide: "../style-guide.css";

.head {
    composes: heading from guide;
    
    font-size: 120%;
}

.body {
    composes: body from guide;
    
    padding: 10px;
}
```

[REPL Link](https://m-css.com/repl/#NrBEHoFsEMEsDsB0BjAzq0AaUABAbtADYCuApgAQDmxsAJqQFzkA6oi4AZrIaQMwrpWAbmbxRiABalotcgG9R5JeWQB7SAAdVqUqiZSZCSuQ4AndVRr0R8ZS1vKOq+ABcAtKlgAvRuQCMAEwADACkNgC+ouIARqq0AJ7yispqmtq6TLEJJuaQlnSkNnbJShoytEZMfkEaAB4RoAC6mGCc3HwCGNiS0hXwxgoOSmqEqqZMAMQAwjMRUUhZiYN2I2OTAGybDY2NQA)

You can also get access to variables defined in other files for simple sharing of useful information.

```css
@value first, second from "./somewhere-else.css";
```
