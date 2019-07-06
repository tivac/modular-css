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
