"use strict";

var postcss = require("postcss"),
    parser  = require("postcss-value-parser"),
    Graph   = require("dependency-graph").DepGraph;

function replacer(values, text) {
    var parts = parser(text);

    parts.walk(function(node) {
        if(node.type !== "word" || !(node.value in values)) {
            return;
        }
        
        node.value = values[node.value];
    });
    
    return parts.toString();
}

module.exports = function(name, process) {
    return postcss.plugin(name, function() {
        return function(css, result) {
            var values  = {},
                graph   = new Graph(),
                keys;
            
            // Find all defined values, catalog them, and remove them
            css.walkAtRules("value", function(rule) {
                var locals = process(result.opts, rule);
                
                if(!locals) {
                    return;
                }
                
                Object.keys(locals).forEach(function(key) {
                    values[key] = locals[key];
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
                values[key] = replacer(values, values[key]);
            });

            // Replace all instances of @value keys w/ the value in declarations & @media rules
            css.walkDecls(function(decl) {
                decl.value = replacer(values, decl.value);
            });

            css.walkAtRules("media", function(rule) {
                rule.params = replacer(values, rule.params);
            });

            result.messages.push({
                type   : "modularcss",
                plugin : name,
                values : values
            });
        };
    });
};
