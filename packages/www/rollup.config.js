"use strict";

module.exports = {
    input : [ "./src/index.js" ],

    output : {
        dir    : "./dist",
        format : "esm",

        sourcemap : true,
    },

    plugins : [
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
        require("rollup-plugin-svelte")(),
        
        // Generate HTML skeleton including built files
        require("./build/rollup-plugin-html")(),

        // Start a local server if in watch mode
        require("./build/rollup-plugin-sirv.js")(),
    ],
};
