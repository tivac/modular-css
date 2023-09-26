---
"@modular-css/processor": patch
"@modular-css/vite": patch
---

Improved vite integration, now correctly invalidating files when a file is changed or deleted.
Improved invalidation in the processor, preventing stale `@value` or `composes` references from being output.
