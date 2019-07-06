#### Namespaced @values

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
