---
"@modular-css/svelte": minor
---

Finally added support for unquoted `class={css.foo}` references. This had been needed for a long time time and I'm happy it's finally here!

Quoted `class="{css.foo}"` style conyinues to be supported as well, along with bare references both in template and `<script>` blocks. 
