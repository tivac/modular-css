---
"@modular-css/css-to-js": patch
"@modular-css/processor": patch
"@modular-css/webpack": patch
---

Ensure that aliased values get exported, fixing #982

```
@value * as values from "./other-file.css";
@value local: values.somevalue;
```

Previously that `local` value wouldn't exist in the JS exports, it was mistakenly treated like the `values` external value.

Also adds semi-colons to variable declarations in the generated JS for vite/rollup/webpack.
