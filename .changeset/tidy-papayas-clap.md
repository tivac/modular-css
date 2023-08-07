---
"@modular-css/processor": patch
---

Fix namespace import referencing via value aliases #964

Updating internal `values` map after importing new values, which was missing previously.
