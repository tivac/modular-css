---
"@modular-css/css-to-js": patch
---

Cleaner output if no named exports

This package used to output an empty `export { }` block if there were no named exports from a `.css` file. That was silly, and has been rectified. While this does change the output in this case it isn't a breaking change, since there were never any named exports being written out in the first place.
