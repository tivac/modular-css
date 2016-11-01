"use strict";

var postcss = require("postcss"),

    composition = require("../parsers/composition.js"),
    resolve     = require("../lib/resolve.js");

function parse(options, field, rule) {
    var parsed = composition.parse(rule[field]),
        file;
    
    if(!parsed.source) {
        return;
    }
    
    file = resolve(options.from, parsed.source);
    
    // Add any compositions to the dependency graph
    options.graph.addNode(file);
    options.graph.addDependency(options.from, file);
}

module.exports = postcss.plugin("postcss-modular-css-graph-nodes", function() {
    return function(css, result) {
        var options = result.opts;
        
        css.walkAtRules("value", parse.bind(null, options, "params"));
        css.walkDecls("composes", parse.bind(null, options, "value"));
    };
});
