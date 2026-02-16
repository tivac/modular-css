import staticAdapter from "@sveltejs/adapter-static";

import { preprocess } from "./build/mcss-setup.js";

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit : {
        // Default is "build" but I'm particular and prefer "dist"
        adapter : staticAdapter({
            pages : "dist",
        }),

        prerender : {
            handleMissingId({ path, message }) {
                if(path === "/repl/") {
                    return;
                }

                // eslint-disable-next-line no-console
                console.warn(path, message);
            },
        },
    },

    // Pass the svelte preprocessor from @modular-css/svelte into sveltekit
    // so that it can make most CSS classes static and shrink the compiled
    // component code way down
    preprocess,
};

export default config;
