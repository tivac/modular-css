---
"@modular-css/processor": patch
---

Fail with `Invalid composes reference` when `composes: x from "file.css"` references a class that doesn't exist in that file, instead of crashing later with `composition is not iterable`.
