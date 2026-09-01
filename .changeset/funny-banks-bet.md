---
"@modular-css/vite": patch
---

fix: vite@8 build compatibility

Vite plugins can return `moduleSideEffects` from their `transform` hook, but with the switch to Rolldown for built output the valid arguments changed.
