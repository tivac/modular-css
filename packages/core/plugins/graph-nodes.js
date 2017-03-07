"use strict";

var selector = require("postcss-selector-parser"),

    parser  = require("../parsers/parser.js");

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
    
    file = options.resolve(options.from, parsed.source);
    
    // Add any compositions to the dependency graph
    options.graph.addNode(file);
    options.graph.addDependency(options.from, file);
}

module.exports = (css, result) => {
    var externals, current;
    
    externals = selector((selectors) =>
        selectors.walkPseudos((pseudo) => {
            // Need to ensure we only process :external pseudos, see #261
            if(pseudo.value !== ":external") {
                return;
            }
            
            parse(result.opts, current, pseudo.nodes.toString());
        })
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

module.exports.postcssPlugin = "modular-css-graph-nodes";
