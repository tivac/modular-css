import path from "path";

import staticAdapter from "@sveltejs/adapter-static";
import preprocessor from "@modular-css/svelte";
import mcss from "@modular-css/vite";
import postcssNested from "postcss-nested";

import viteMd from "./build/vite-md.js";
import viteBuildMcss from "./build/vite-build-mcss.js";

// Set up the svelte preprocessor and get a reference to the
// mcss processor so we can pass it into the vite plugin
const { preprocess, processor } = preprocessor({
    // Default is .css but we need .mcss because of vite
    include : /\.mcss$/i,
    
    // These cause no end of warnings from the processor because
    // they don't make nice JS identifiers usually, so disabled
    exportGlobals : false,

    // I like nesting, so sue me
    before : [
        postcssNested(),
    ],
});

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit : {
        // Default is "build" but I'm particular and prefer "dist"
        adapter : staticAdapter({
            pages : "dist",
        }),

        // hydrate the <body> element in src/app.html, the default
        // is a <div> but I don't understand why that is necessary
        // and think the resulting HTML looks kinda sloppy
        target : "body",

        vite : {
            plugins : [
                // Bundle @modular-css/processor and its dependencies via
                // embedded rollup within rollup because vite doesn't handle
                // cjs modules and node globals very well
                viteBuildMcss(),

                // Bundle markdown documents
                viteMd(),

                // Bundle .mcss files
                mcss({
                    processor,
                }),
            ],

            optimizeDeps : {
                // Required because npm workspaces use links, and vite
                // won't optimize linked packages by default
                include : [
                    "@modular-css/processor",
                ],
            },

            server : {
                fs : {
                    // See the allow list below for why this has to be disabled 😒
                    strict : false,

                    // This is configured but useless due to vite prepending all
                    // these paths weirdly on windows. They come out like this:
                    // /C:/Users/.../node_modules/@modular-css/CHANGELOG.md which is.... never
                    // gonna match anything on windows.
                    allow : [
                        path.resolve("./package.json"),
                        path.resolve("../../CHANGELOG.md"),
                    ],
                },
            },
        },

        // C'mon, this is clearly a better choice
        trailingSlash : "always",
    },

    // Pass the svelte preprocessor from @modular-css/svelte into sveltekit
    // so that it can make most CSS classes static and shrink the compiled
    // component code way down
    preprocess,
};

export default config;
