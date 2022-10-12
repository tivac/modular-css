---
"@modular-css/css-to-js": patch
---

Class ordering in `.css` files could lead to invalid identifiers being created, so always make sure every class defined in the `.css` file has a local JS identifier before building the string concatenation to represent composition.
