# Features

CSS Modules defines a bunch of great features, and `modular-css` supports the best of them in a straightforward and consistent way.

- [Values](#values)
  - [Namespaces](#namespaces)
  - [Importing](#importing)
- [Scoped Selectors](#scoped-selectors)
- [Composition](#composition)
  - [Overriding Styles](#overriding-styles)

## Values

Values are useful in CSS, they're coming to the spec soon. Use them now because it'll make your life easier!

```css
/* values.css */
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

### Namespaces

`modular-css` also supports value namespaces as a convenient shorthand way to access a bunch of shared values from a file.

```css
/* Specific values being imported */
@value vbox, hbox, centered from "./layout.css";

.content {
    composes: vbox, centered;
}

/* Namespace to collect all imports */
@value * as layout from "./layout.css";

.content {
    composes: layout.vbox, layout.centered;
}
```

### Importing

You can also import all the `@value` definitions from another file into the current one. The imported `@value`s will also be exported from that file, allowing for simple theming setups with overriden colors/dimensions/etc.

```css
/* colors.css */
@value main: red;
@value bg: white;
```

```css
/* mobile-colors.css */
@value * from "./colors.css";
@value bg: gray;
```

```css
@value * as colors from "./mobile-colors.css";

body {
    background: colors.bg; /* gray */
    color: colors.main; /* red */
}
```

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
/* styles.css */
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

## Composition

Selector limitations mean that it's difficult to use complicated selectors, so to enable building anything of complexity you can compose selectors. These compositions can be within a file or even pull in classes defined in other files.

```css
/* styles.css */
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
/* input.css */
.input {
    width: 100%;
}

/* fieldset.css */
.fieldset :external(input from "./input.css") {
    width: 50%;
}
```
