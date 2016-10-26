"use strict";

var postcss = require("postcss"),
    parser  = require("postcss-value-parser"),
    Graph   = require("dependency-graph").DepGraph;

function replacer(values, sources, text) {
    var parts = parser(text),
        source;
    
    parts.walk(function(node) {
        if(node.type !== "word" || !(node.value in values)) {
            return;
        }
        
        // Re-assign source first because we're changing the key (node.value) otherwise
        // Only storing the last source that applied, we can only use one anyways
        source     = sources[node.value];
        node.value = values[node.value];
    });
    
    return {
        value  : parts.toString(),
        source : source
    };
}

module.exports = function(name, process) {
    return postcss.plugin(name, function() {
        return function(css, result) {
            var values  = {},
                sources = {},
                details = result.opts.files[result.opts.from],
                graph   = new Graph(),
                keys;
            
            // Find all defined values, catalog them, and remove them
            css.walkAtRules("value", function(rule) {
                var locals = process(result.opts, rule);
                
                if(!locals) {
                    return;
                }
                
                Object.keys(locals).forEach(function(key) {
                    values[key]  = locals[key];
                    sources[key] = rule.source;
                    
                    graph.addNode(key);
                });
                
                rule.remove();
            });
            
            keys = Object.keys(values);
            
            // Early out if no values to process
            if(!keys.length) {
                return;
            }
            
            keys.forEach(function(key) {
                var parts = parser(values[key]);

                parts.walk(function(node) {
                    if(node.type !== "word" || !(node.value in values)) {
                        return;
                    }
                    
                    graph.addDependency(key, node.value);
                });
            });
            
            // Ensure that any key references are updated
            graph.overallOrder().forEach(function(key) {
                var replaced = replacer(values, sources, values[key]);
                
                values[key] = replaced.value;
                
                if(replaced.source) {
                    sources[key] = replaced.source;
                }
            });

            // Replace all instances of @value keys w/ the value in declarations & @media rules
            css.walkDecls(function(decl) {
                var replaced = replacer(values, sources, decl.value);
                
                decl.value = replaced.value;
                
                if(replaced.source) {
                    decl.source = replaced.source;
                }
            });

            css.walkAtRules(/media|value/, function(rule) {
                var replaced = replacer(values, sources, rule.params);
                
                rule.params = replaced.value;
                
                if(replaced.source) {
                    rule.source = replaced.source;
                }
            });
            
            // Can't use messages for values plugins, messages aren't persisted
            // between .process calls, even if you pass in a raw result object
            details.values  = Object.assign(details.values || {}, values);
            details.sources = Object.assign(details.sources || {}, sources);
        };
    });
};
