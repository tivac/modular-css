---
"@modular-css/css-to-js": patch
---

Prevent explosions on unknown `id`s

`@modular-css/css-to-js` would throw an error if it was passed an `id` that didn't exist as a file in the `processor` instance. Now, that'll early out with reasonable-but-still-gross output and a warning.
