### sveltekit

[SvelteKit](https://kit.svelte.dev/) support for modular-css is provided by `@modular-css/vite` (since SvelteKit is powered by vite).

**NOTE**: To work around vite's built-in CSS handling you will need to use a file extension other than `.css` for modular-css files. The default for this plugin is `.mcss`, but you can use [`include`](#bundlers-vite-options-includeexclude) to change that.

#### Install

```shell
> npm i @modular-css/vite --save-dev
```

#### Usage

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-auto';
import mcss from "@modular-css/vite";

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit : {
        adapter : adapter(),
    
        // Add mcss vite plugin to the underlying vite instance
        vite : {
            plugins : [
                mcss(),
            ]
        },
    },
};

export default config;
```

If you'd like to use the [modular-css svelte preprocessor](#other-tools-svelte-preprocessor) with SvelteKit (and you definitely should because it'll make your site faster) you can use the instructions for [`@modular-css/svelte` with `vite`](#other-tools-svelte-preprocessor-usage-via-vite).

#### Options

See the [`vite` options](#bundlers-vite-options).
