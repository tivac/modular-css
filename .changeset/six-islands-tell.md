---
"@modular-css/css-to-js": minor
"@modular-css/vite": minor
"@modular-css/rollup": minor
"@modular-css/webpack": minor
---

## CSS coverage & warnings on unused classes

Added `dev.warn` and `dev.coverage` as supported options for `@modular-css/css-to-js` package, and by extension `@modular-css/rollup`, `@modular-css/vite`, and `@modular-css/webpack`.

`dev.warn` will cause unknown classes requested from JS to log a warning to the console, instead of the current errors that are thrown.

`dev.coverage` will cause a global named `mcssCoverage` to be created which will track accesses of all exported classes per file and allow you to identify unused styles.

Example of a `mcssCoverage` object

```js
{
    "packages/vite/tests/specimens/shared/static-c.mcss" : { c : 0 },
    "packages/vite/tests/specimens/static/a.mcss" : { a : 1 },
    "packages/vite/tests/specimens/static/b.mcss" : { b : 1 },
}
```
