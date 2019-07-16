#### Wildcard @values

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

[REPL Link](https://m-css.com/repl/#NrBEHoFsEMEsDsB0BjAzq0AaUABAbtADYCuApgAQBU5AZgE4D2k5AOqIuDbIaQMwro2Abhbx8RMuQBGAcwBc0wtGQBrEfFFSGAEwCe5AN6jyJ6cpUzGxeNoWz1p8sgaEGdBTATqAvqAC6mGCc3HwCGNjiJBSe8Ap0pNrqkZKyCgDuABawAC6kQv5+QA)

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

[REPL Link](https://m-css.com/repl/#NrBEHoFsEMEsDsB0BjAzq0AaUABAbtADYCuApgAQBU50q5yA9oQwE50BmLDk5AOqInDtYhUgBYU6fgG5e8OQCMGAEwCe5AN5zyO8gujIA1gHMuxeMoBc9Jq1SIFx2fF03mLa43f2YCZwF9QAF1MMCERUgBmSQxsfCIycl94axZSZWd4kgpHawB3AAtYABdSaWDQiGFRCTRY3AJsqnJObj4BcNFoupk5LMTc8lNoVXKgoKA)
