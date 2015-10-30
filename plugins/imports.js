"use strict";

var postcss = require("postcss"),
    Graph   = require("dependency-graph").DepGraph,

    plugin = "postcss-modular-css-imports";

module.exports = postcss.plugin(plugin, function() {
    return function(css, result) {
        var files = {},
            graph = new Graph();
        
        

        result.messages.push({
            type   : "modularcss",
            plugin : plugin,
            files  : values
        });
    };
});
