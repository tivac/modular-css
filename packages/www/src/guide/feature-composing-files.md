#### Composing Files

When necessary you can also use the `@composes` at-rule to enable composing an entire CSS file, instead of going rule-by-rule. This is mostly useful when you've got a base style you want to apply to a component but you need to modify just a single style from the base. Instead of manually creating shadowed versions of all the classes in the base CSS, you can use `@composes` to save a bunch of repetition and potential for fat-fingering.

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
