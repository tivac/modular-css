---
"@modular-css/css-to-js": patch
---

Handle `options.namedExport.warn` correctly

Previously setting `namedExport.warn` to `false` would still return warnings in some cases. Now if disabled it truly doesn't warn you.
