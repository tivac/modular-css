## vs CSS Modules

While `modular-css` was originallly built directly off the CSS Modules spec, during the course of development some decisions have been made that have broken 100% compatibility. In general these changes have been made in an attempt to try and add consistency or pave cowpaths. There have also been a few feature additions that enable solving new classes of problems or fix pain points in the spec.

### :global

In CSS Modules the `:global` pseudo-class allows usage with or without parentheses around its arguments.

```css
/* CSS Modules */
:global .one { ... }
:global(.one) { ... }
```

In `modular-css` only the parenthesized form is allowed to reduce ambiguity around which selectors/names are being made global.

```css
/* modular-css */
:global(.one) { ... }
```

### Scope

In CSS Modules it is possible to switch back and forth from local and global scope using `:global` and `:local`.

```css
/* CSS Modules */
.localA :global .global-b .global-c :local(.localD.localE) .global-d { ... }
```

In `modular-css` all CSS is local by default, and since `:global()` is [required to use parentheses](#scoped-selectors) there is no need for the `:local` pseudo.

```css
/* modular-css */
.localA :global(.global-b .global-c) .localD.localE :global(.global-d) { ... }
```

### Style overriding

In CSS Modules there is no support for modifying styles in rules that aren't direct ancestors via `composes`.

Discussion around potential solutions was happening in [css-modules/css-modules#147](https://github.com/css-modules/css-modules/issues/147) but eventually died out.

`modular-css` has implemented the `:external()` proposal from that issue. More context is available in the [Overriding Styles section](#overriding-styles).

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

### Namespaces

CSS Modules allows for importing multiple values from an external file.

```css
/* CSS Modules */
@value one, two, three, red, blue, green, small, medium, large from "./constants.css";

.a {
  color: red;
  width: small;
}
```

`modular-css` implements a suggestion made in [css-modules/css-modules#186](https://github.com/css-modules/css-modules/issues/186#issuecomment-257421710) to allow importing all of a file's exported values and aliasing it for easy use. More documentation can be found in the [Namespaced values section](#namespaced-values).

```css
/* modular-css */
@value * as constants from "./constants.css";

.a {
  color: constants.red;
  width: constants.small;
}
```
