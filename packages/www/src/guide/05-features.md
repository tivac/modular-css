# Features

`modular-css` implements the best features of the CSS Modules spec and then adds on several extra features to make for a smoother developer experience.

@[toc]

## Scoped Selectors

By default all CSS selectors live in the global scope of the page and are chosen based on specificity rules. This has proven to be a model that makes it difficult to succeed and incredibly easy to blow off your own foot. `modular-css` scopes all selectors to the local file by default, ensuring that your CSS is always exactly as specific as it should be.

```css
.wooga { color: red; }

/* Becomes */

.f5507abd_wooga { color: red; }
```

By default the selector scoping is based off hashing the contents of the file but you can also provide your own custom function.

Using these now-mangled selectors would be problematic, if `modular-css` didn't give you the tools required to use them easily. When using the browserify transform any `require()` calls for CSS files will instead return an object where the keys match the classes/ids defined in the requested CSS file.

```js
var css = require("./styles.css");

// css is:
/*
{
    wooga : "f5507abd3_wooga",
    ...
}
*/

// so mithril code (or any templating code!) can do the following
m("div", { class : css.wooga });
// which would output
// <div class="f5507abd_wooga"></div>
```

These arrays of selectors can then be applied to elements using the much more nicely-named object keys and you're off to the races.

You can opt out of selector scoping by wrapping your classes/ids in the `:global()` pseudo-class, this will prevent them from being renamed but they will still be available in the module's exported object.

```css
/* == styles.css == */
:global(.global) { color: red; }
```
```js
var css = require("./styles.css");

// css is:
/*
{
    global : "global"
}
*/
```

Selector scoping is **only** done on simple classes/ids, any selectors containing tags or pseudo-selectors won't be exported.

`:global()` is treated the same as a CSS pseudo-class and therefore cannot wrap multiple comma seperated rules. For example if you're using a CSS reset the following is required:

```css
/* Local Scoped */
ol, ul {
    list-style: none;
}

/* Global Scoped (Wrong!) */
:global(ol, ul) {
    list-style: none;
}

/* Global Scoped (Correct!) */
:global(ol), :global(ul) {
    list-style: none;
}
```

Adding `:global()` to every comma seperated rule would be tedious when using something like [Eric Meyer's CSS Reset](http://meyerweb.com/eric/tools/css/reset/). Therefore it is recommended that you seperate the reset in to its own file, and make use of the [postcss-import](https://github.com/postcss/postcss-import) module with the [after](https://github.com/tivac/modular-css/blob/master/docs/api.md#after) or [done](https://github.com/tivac/modular-css/blob/master/docs/api.md#done) hooks to include the file when modular-css has finished processing. You would then need to include `@import "reset.css";` somewhere in one of your CSS files.

## Composition

Selector limitations mean that it's difficult to use complicated selectors, so to enable building anything of complexity you can compose selectors. These compositions can be within a file or even pull in classes defined in other files.

```css
/* == styles.css == */
.single {
    composes: other from "./other.css";
    color: red;
}

.multiple {
    composes: more, than, one from "./multiple.css";
    /*
    Since .multiple doesn't declare any rules other than composes
    aggregate styles from other rules it will be stripped from the output
    */
}

.local {
    composes: single;
}
```

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

You can also get access to variables defined in other files for simple sharing of useful information.

```css
@value first, second from "./somewhere-else.css";
```

### Overriding Styles

Sometimes a component will need some customization for use in a specific location/design, but you don't want to bake that customization into the component.`:external(...)` helps you solve that problem.

In this case we've got an `input` component that is normally 100% of the width of its container, but when it's within the `fieldset` component it should only be half as wide.

```css
/* == input.css == */
.input {
    width: 100%;
}

/* == fieldset.css == */
.fieldset :external(input from "./input.css") {
    width: 50%;
}
```
## Values

Values are re-usable pieces of content that can be used instead of hardcoding colors, sizes, media queries, or most other forms of CSS values. They're automatically replaced during the build with their defined value, and can also be composed between files for further re-use or overriding.

```css
/* == values.css == */
@value alert: #F00;
@value small: (max-width: 600px);

@media small {
    .alert { color: alert; }
}

/* will be output as */

@media (max-width: 600px) {
    .alert { color: #F00; }
}
```

### Importing Values

`@value`s can be imported from another file by using a slightly different syntax.

```css
/* == colors.css == */
@value main: red;
@value bg: white;

/* == site.css == */
@value main from "./colors.css";

body {
    color: main;
}
```

It's also possible to import multiple values at once.

```css
/* == colors.css == */
@value main: red;
@value bg: white;

/* == site.css == */
@value main, bg from "./colors.css";

body {
    color: main;
    background: bg;
}
```

#### Namespaced Imports

`@value`s can be imported as a namespace which provides a convenient shorthand way to access a bunch of shared values from a file.

```css
/* == colors.css == */
@value main: red;
@value bg: white;

/* == site.css == */
@value * as colors from "./colors.css";

body {
    color: colors.main;
    background: colors.bg;
}
```

#### Wildcard Imports

It's possible to import all the `@value` definitions from another file into the current one. Any local `@value` declarations will override the imported values.

```css
/* == colors.css == */
@value main: red;
@value bg: white;

/* == site.css == */
@value * from "./colors.css";
@value bg: black;

body {
    background: bg; /* black */
    color: main; /* red */
}
```

Since all files in `modular-css` with `@value` declaration make that value available to other files it's possible to use the wildcard imports feature to build complex theming systems. When using wildcard imports all the `@value`s from the source file are re-exported by the file doing the importing.

```css
/* == colors.css == */
@value main: red;
@value bg: white;

/* == mobile-colors.css == */
@value * from "./colors.css";
@value bg: gray;

/* == site.css == */
@value * as colors from "./mobile-colors.css";

body {
    background: colors.bg; /* gray */
    color: colors.main; /* red */
}
```

