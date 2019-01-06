"use strict";

// TODO: what processor options are necessary?
const { processor, preprocess } = require("@modular-css/svelte")();

module.exports = {
    input : [ "./src/index.js" ],

    output : {
        dir    : "./dist",
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
        
        // Generate HTML skeleton including built files
        require("./build/rollup-plugin-html")(),

        // Start a local server if in watch mode
        process.env.ROLLUP_WATCH && require("./build/rollup-plugin-sirv.js")(),
    ],
};
