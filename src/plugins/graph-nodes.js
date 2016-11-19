"use strict";

var postcss  = require("postcss"),
    selector = require("postcss-selector-parser"),

    parser  = require("../parsers/parser.js"),
    resolve = require("../lib/resolve.js");

function parse(options, rule, value) {
    var parsed, file;
    
    try {
        parsed = parser.parse(value);
    } catch(e) {
        throw rule.error(e.toString(), {
            word : value.substring(e.location.start.offset, e.location.end.offset)
        });
    }
    
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
        var externals, current;
        
        externals = selector((selectors) =>
            selectors.walkPseudos((pseudo) => parse(result.opts, current, pseudo.nodes.toString()))
        );
        
        // @value <value> from <file>
        css.walkAtRules("value", (rule) => parse(result.opts, rule, rule.params));

        // { composes: <rule> from <file> }
        css.walkDecls("composes", (rule) => parse(result.opts, rule, rule.value));

        // :external(<rule> from <file>) { ... }
        // Have to assign to current so postcss-selector-parser can reference the right thing
        // in errors
        css.walkRules(/:external/, (rule) => {
            current = rule;
            
            externals.process(rule.selector);
        });
    };
});
