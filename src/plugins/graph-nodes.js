"use strict";

var postcss = require("postcss"),

    composition = require("../_composition");

function parse(options, field, rule) {
    var parsed = composition(options.from, rule[field]);
    
    if(!parsed || !parsed.source) {
        return;
    }
    
    options.graph.addNode(parsed.source);
    options.graph.addDependency(options.from, parsed.source);
}

module.exports = postcss.plugin("postcss-modular-css-graph-nodes", function() {
    return function(css, result) {
        css.walkAtRules("value", parse.bind(null, result.opts, "params"));
        css.walkDecls("composes", parse.bind(null, result.opts, "value"));
    };
});
