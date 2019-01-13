"use strict";

const path = require("path");

const { isProduction, isWatch, dest } = require("./build/environment.js");

// eslint-disable-next-line no-empty-function
const noop = () => {};

const { processor, preprocess } = require("@modular-css/svelte")({
    namer : isProduction && require("@modular-css/shortnames")(),

    done : [
        isProduction ? require("cssnano")() : noop,
    ]
});

module.exports = {
    input : [ "./src/repl/index.js" ],

    output : {
        dir    : path.join(dest, "/repl"),
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
            module : true,
            
            preferBuiltins : false,

            browser : true,
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
        
        // Generate HTML for the REPL including refernces to CSS/JS
        require("./build/rollup-plugin-repl-html.js")(),

        // Generate static pages from markdown content
        require("./build/rollup-plugin-markdown-html.js")({
            preprocess,
        }),

        // Start a local server if in watch mode
        isWatch && require("./build/rollup-plugin-sirv.js")(),

        // Compress JS in production mode
        isProduction && require("rollup-plugin-terser").terser(),
    ],
};
