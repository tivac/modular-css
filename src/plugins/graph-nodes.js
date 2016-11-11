"use strict";

var postcss  = require("postcss"),
    selector = require("postcss-selector-parser"),

    parser  = require("../parsers/parser.js"),
    resolve = require("../lib/resolve.js");

function parse(options, value) {
    var parsed = parser.parse(value),
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
        var options   = result.opts,
            externals = selector((selectors) =>
                selectors.walkPseudos((pseudo) => parse(options, pseudo.nodes.toString()))
            );
        
        // @value <value> from <file>
        css.walkAtRules("value", (rule) => parse(options, rule.params));

        // { composes: <rule> from <file> }
        css.walkDecls("composes", (rule) => parse(options, rule.value));

        // :external(<rule> from <file>) { ... }
        css.walkRules(/:external/, (rule) => externals.process(rule.selector));
    };
});
