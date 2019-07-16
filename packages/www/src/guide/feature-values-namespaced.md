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

[REPL Link](https://m-css.com/repl/#NrBEHoFsEMEsDsB0BjAzq0AaUABAbtADYCuApgAQBU50q5yA9oQwE50BmLDk5AOqInDtYhUgGYU6fgG5e8OQCMGAEwCe5AN5zyO+k1YAuPczaIYCWfF3kF0ZAGsA5l2LxlRxidSIFjywF9QAF1MMCERcUkMbHwiMnJzeCMWUmVLWJIKXyMAdwALWAAXUmlgoKA)
