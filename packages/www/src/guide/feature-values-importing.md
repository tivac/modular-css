#### Importing @values

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

[REPL Link](https://m-css.com/repl/#NrBEHoFsEMEsDsB0BjAzq0AaUABAbtADYCuApgAQwLkBmATgPaTkA6oi4NshpAzCujYBuFvFEAjBgBMAnuQDeo8svLIGhBnQBclOPBHwAvqAC6mMJ258BGbPiJldCHXVJSD9khXEBzHQHcAC1gAF1IhUxMgA)

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

[REPL Link](https://m-css.com/repl/#NrBEHoFsEMEsDsB0BjAzq0AaUABAbtADYCuApgAQwKbkBGA5uQGYBOA9pOQDqiLhOxCpAMwp0PANxd402mwAmAT3IBvaeQ3lkbQmxYAuSnHhT4mutGQBreu2Lx5hhqYC+oALqYw-QSLEZsfCIyIwRDFlJ5UyCSCgZDAHcAC1gAF1IJD3cgA)
