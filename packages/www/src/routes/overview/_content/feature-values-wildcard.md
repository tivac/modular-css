#### Wildcard @values

It's possible to import all the `@value` definitions from another file into the current one. Any local `@value` declarations will override the imported values.

```css
/* === colors.css === */
@value main: red;
@value bg: white;

/* === site.css === */
@value * from "./colors.css";
@value bg: black;

body {
    /* black */
    background: bg;
    /* red */
    color: main;
}
```

Since all files in `modular-css` with `@value` declaration make that value available to other files it's possible to use the wildcard imports feature to build complex theming systems. When using wildcard imports all the `@value` declarations from the source file are re-exported by the file doing the importing.

```css
/* === colors.css === */
@value main: red;
@value bg: white;

/* === mobile-colors.css === */
@value * from "./colors.css";
@value bg: gray;

/* === site.css === */
@value * as colors from "./mobile-colors.css";

body {
    /* gray */
    background: colors.bg;
    /* red */
    color: colors.main;
}
```
