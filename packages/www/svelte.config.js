import path from "path";

import { NodeModulesPolyfillPlugin as modulesPolyfill } from "@esbuild-plugins/node-modules-polyfill";
import { NodeGlobalsPolyfillPlugin as globalsPolyfill } from "@esbuild-plugins/node-globals-polyfill";

import staticAdapter from "@sveltejs/adapter-static";
import preprocessor from "@modular-css/svelte";
import mcss from "@modular-css/vite";

import postcssNested from "postcss-nested";

import viteMd from "./util/vite-md.js";
import viteBuildMcss from "./util/vite-build-mcss.js";

const { preprocess, processor } = preprocessor({
    verbose : false,
    include : /\.mcss$/i,
    
    exportGlobals : false,

    before : [
        postcssNested(),
    ],
});

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit : {
        adapter : staticAdapter({
            pages : "dist",
        }),

        // hydrate the <div id="svelte"> element in src/app.html
        target : "body",

        vite : {
            clearScreen : false,

            plugins : [
                viteBuildMcss(),

                viteMd(),

                mcss({
                    // exportGlobals : false,
                    
                    processor,
                }),
            ],

            optimizeDeps : {
                include : [
                    "@modular-css/processor",
                ],

                esbuildOptions : {
                    plugins : [
                        modulesPolyfill(),
                        globalsPolyfill({
                            process : true,
                        }),
                    ],
                },
            },

            server : {
                fs : {
                    strict : false,
                    allow  : [
                        path.resolve("./package.json"),
                        path.resolve("../../CHANGELOG.md"),
                    ],
                },
            },
        },

        trailingSlash : "always",
    },

    preprocess,
};

export default config;
