### Composing Files

Despite the availability of `composes` and `:external()` there are still times where the design of CSS Modules (& by extension, `modular-css`) makes life more difficult than it should be. One of the most common of these is creating a base CSS file for something, then creating multiple small tweaks to that base style.

A straightforward approach to solving this would be creating shadow selectors of everything you needed and making them all use `composes` to pull in the inherited style. This is both time-consuming and exceedingly error-prone. A slightly different approach is to require both the base CSS file and the override CSS file and merge the results in Javascript. This can work, but means that the CSS dependency information is now incomplete which can lead to incorrect chunking when splitting up bundles. It also adds complexity to the JS usage of `modular-css`.

Fortunately, `@composes` exists to solve those problems!

```css
/* == base.css == */
.header {
    color: red;
}

.body {
    color: blue;
}

/* Imagine 20-30 more styles here... */

/* == custom.css == */
@composes "./base.css";

.title {
    composes: header;

    background: red;
}

```

When `custom.css` is required the JS object will contain the selectors defined in that file as well as any selectors from `base.css`. It also allowed for the `.title` class in `custom.css` to use `composes: header` even though `.header` wasn't defined in that file at all.

```js
var css = require("./custom.css");

// css is:
/*
{
    // from custom.css
    title   : "dafdfcc_header aeacf0c_title",

    // plus everything from base.css
    header : "dafdfcc_header",
    body   : "dafdfcc_body"
}
*/
```

There can be **only one `@composes` declaration per file**, just to keep things straightforward. Chaining of files is supported as well, the files will be processed in the correct order based on their dependencies and files at the end of the chain will include all of the rules from every other file they & their dependencies included. This feels like it could get hard to manage quickly, so it's recommended to use `@composes` only when necessary and try to avoid reaching for it as the very first solution to a problem!
