---
"@modular-css/css-to-js": patch
---

fix: deconflict variable name for the root classes object in dev mode

Otherwise if you have a class named `.data {}` in your CSS we output invalid JS
