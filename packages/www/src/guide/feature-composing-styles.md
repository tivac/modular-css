### Style Composition

Selector limitations mean that it's difficult to use complicated selectors, so to enable building anything of complexity you can compose selectors. These compositions can be within a file, reference global CSS class, or even pull in classes defined in other files.

::: repl
```css
.composable {
    background: black;
}

.local {
    composes: composable;

    color: red;
}

/* Will be stripped from the CSS output because it doesn't */
/* contain any actual rules */
.removed {
    composes: local;
}
```
:::

When this file is required the JS object will contain the expected keys, but the arrays will now contain more values.

```javascript
var css = require("./style.css");

// css is:
/*
{
    composable : "dafdfcc_composable",
    local      : "dafdfcc_composable aeacf0c_local",
    removed    : "dafdfcc_composable aeacf0c_local aeacf0c_removed"
}
*/
```

Composition also works between files, by providing the source file.

::: repl
```css
/* === style-guide.css === */

.body {
    margin: 10px;
    height: 100%;
}

/* === home-page.css === */

.body {
    composes: body from "/style-guide.css";

    padding: 10px;
}
```
::::

Styles can also be composed directly from the global scope to help with interoperability
with CSS frameworks or other non-module styles.

::: repl
```css
.box {
    composes: d-flex, px-4, py-3 from global;

    color: blue;
}
```
::::


If you're going to be doing a lot of composition with another file you can store the filename into a value for ease of referencing.

::: repl
```css
/* === style-guide.css === */
.heading {
    font-size: 140%;
}

.body {
    margin: 10px;
    height: 100%;
}

/* === home-page.css === */
@value guide: "/style-guide.css";

.head {
    composes: heading from guide;

    font-size: 120%;
}

.body {
    composes: body from guide;

    padding: 10px;
}
```
