"use strict";

const { isProduction, isWatch, dest } = require("./build/environment.js");

// eslint-disable-next-line no-empty-function
const noop = () => {};

// TODO: May want to split this out, it's causing REPL CSS to appear in other bundles
const { processor, preprocess } = require("@modular-css/svelte")({
    namer : isProduction && require("@modular-css/shortnames")(),

    done : [
        isProduction ? require("cssnano")() : noop,
    ]
});

module.exports = [
    // Browser build of the REPL
    {
        input : {
            repl : "./src/repl/index.js",
        },

        output : {
            dir    : dest,
            format : "esm",

            sourcemap : true,

            entryFileNames : "[name]-[hash].js",
        },

        plugins : [
            // Wipe the destination dir on each rebuild
            require("./build/rollup-plugin-clean")(),
            
            require("rollup-plugin-alias")({
                fs   : require.resolve("./stubs/fs.js"),
                path : require.resolve("./stubs/path.js"),
            }),

            require("rollup-plugin-node-resolve")({
                module  : true,
                browser : true,

                preferBuiltins : false,
            }),
            
            // Run webpack INSIDE ROLLUP to bundle postcss because it's fuckered otherwise
            require("./build/rollup-plugin-postcss.js")(),
            
            require("rollup-plugin-commonjs")(),
            require("rollup-plugin-node-globals")(),
            require("rollup-plugin-node-builtins")(),
            require("rollup-plugin-json")(),
            
            require("rollup-plugin-svelte")({
                preprocess,
            }),

            require("@modular-css/rollup")({
                processor,
            }),
            
            // Start a local server if in watch mode
            isWatch && require("./build/rollup-plugin-sirv.js")(),

            // Compress JS in production mode
            isProduction && require("rollup-plugin-terser").terser(),
        ],
    },
    // CJS Build of home/guide for node generation
    {
        input : {
            guide : "./src/guide/guide.html",
            home  : "./src/home/home.html",
            page  : "./src/page.html",
        },

        output : {
            dir    : dest,
            format : "cjs",

            sourcemap : false,

            entryFileNames : "[name].[format].js",
            chunkFileNames : "[name].[format].js",
        },

        plugins : [
            require("rollup-plugin-node-resolve")({
                module  : true,
                browser : true,

                preferBuiltins : false,
            }),
            
            require("rollup-plugin-commonjs")(),
            require("rollup-plugin-json")(),
            
            require("rollup-plugin-svelte")({
                preprocess,
                generate : "ssr",
            }),

            require("@modular-css/rollup")({
                processor,
            }),

            // Generate HTML for all the static pages
            require("./build/rollup-plugin-generate-html.js")(),
        ]
    }
];
