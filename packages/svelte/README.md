@modular-css/svelte  [![NPM Version](https://img.shields.io/npm/v/@modular-css/svelte.svg)](https://www.npmjs.com/package/@modular-css/svelte) [![NPM License](https://img.shields.io/npm/l/@modular-css/svelte.svg)](https://www.npmjs.com/package/@modular-css/svelte) [![NPM Downloads](https://img.shields.io/npm/dm/@modular-css/svelte.svg)](https://www.npmjs.com/package/@modular-css/svelte)
===========

Svelte preprocessor support for [`modular-css`](https://github.com/tivac/modular-css).

Process inline `<style type="text/m-css">` or `<link>` or `import styles from "./foo.css";` references inside your Svelte components using the full power of `modular-css`. Dynamic references will be replaced where possible with static ones, allowing for greater compile-time optimizations, smaller bundles, and even faster runtime performance!

## Example

Turns this

```html
<div class="{css.main}">
    <h1 class="{css.title}">Title</h1>
</div>

<style>
    .main {
        ...
    }

    .title {
        ...
    }
</style>
```

into what is effectively this

```html
<div class="abc123_main">
    <h1 class="abc123_title">Title</h1>
</div>
```

See the svelte section on [m-css.com](https://m-css.com/api/#other-tools-svelte-preprocessor) for more details.
