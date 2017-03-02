"use strict";

module.exports = {
    entry : "index.js",
    dest  : "./gen/app.js",

    format    : "iife",
    sourceMap : true,
    
    plugins : [
        require("rollup-plugin-node-resolve")({
            browser : true
        }),
        require("rollup-plugin-json")(),
        require("rollup-plugin-commonjs")(),
        require("rollup-plugin-node-globals")(),
        require("rollup-plugin-node-builtins")()
    ]
};
