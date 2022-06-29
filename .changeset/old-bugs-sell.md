---
"@modular-css/css-to-js": patch
---

Always use absolute paths internally

Previously `@modular-css/css-to-js` would use the path as passed to it, which could cause issues with bundlers that passed relative paths (usually because of the use of aliases). Since the module already had to normalize paths to be absolute it will now use those absolute paths internally when looking up information from the `Processor` instance.
