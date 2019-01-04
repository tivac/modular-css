"use strict";

module.exports = {
    input : [ "./src/index.js" ],

    output : {
        dir    : "./dist",
        format : "esm",

        sourcemap : true,
    },

    plugins : [
        require("rollup-plugin-node-resolve")({
            preferBuiltins : false,
        }),
        require("./build/rollup-plugin-postcss.js")(),
        require("rollup-plugin-commonjs")(),
        require("rollup-plugin-node-globals")(),
        require("rollup-plugin-node-builtins")(),
        // require("rollup-plugin-alias")({
        //     fs : require.resolve("./stubs/fs.js")
        // }),
        require("rollup-plugin-json")(),
        
        require("./build/rollup-plugin-html")(),

        require("./build/rollup-plugin-sirv.js")(),
    ],
};
