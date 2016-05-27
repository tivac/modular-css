"use strict";

var postcss      = require("postcss"),
    
    Graph   = require("dependency-graph").DepGraph,
    
    assign    = require("lodash.assign"),
    unique    = require("lodash.uniq"),
    invert    = require("lodash.invert"),
    mapvalues = require("lodash.mapvalues"),

    message     = require("../lib/message"),
    composition = require("../lib/composition"),
    identifiers = require("../lib/identifiers"),
    
    plugin = "postcss-modular-css-composition";

module.exports = postcss.plugin(plugin, function() {
    return function(css, result) {
        var refs  = message(result, "classes"),
            map   = invert(refs),
            opts  = result.opts,
            graph = new Graph(),
            out   = assign({}, refs);
        
        Object.keys(refs).forEach(function(key) {
            graph.addNode(key);
        });

        // Go look up "composes" declarations and populate dependency graph
        css.walkDecls("composes", function(decl) {
            var selectors, details;
            
            details   = composition.decl(opts.from, decl);
            selectors = identifiers.parse(decl.parent.selector);

            if(details.source && (!opts.files || !opts.files[details.source])) {
                throw decl.error("Invalid file reference", { word : decl.value });
            }

            // Add references and update graph
            details.rules.forEach(function(rule) {
                var global = details.types[rule] === "global",
                    scoped = global ? rule : (details.source || "") + rule;

                graph.addNode(scoped);

                selectors.forEach(function(selector) {
                    graph.addDependency(map[selector], scoped);
                });

                if(global) {
                    refs[rule] = [ rule ];

                    return;
                }

                if(details.source) {
                    refs[scoped] = opts.files[details.source].exports[rule];
                }

                if(!refs[scoped]) {
                    throw decl.error("Invalid composes reference", { word : rule });
                }
            });

            // Remove just the composes declaration if there are other declarations
            if(decl.parent.nodes.length > 1) {
                return decl.remove();
            }
            
            // Remove the entire rule because it only contained the composes declaration
            return decl.parent.remove();
        });
        
        // Update out by walking dep graph and updating classes
        graph.overallOrder().forEach(function(selector) {
            graph.dependenciesOf(selector).reverse().forEach(function(dep) {
                out[selector] = refs[dep].concat(out[selector]);
            });
        });
        
        result.messages.push({
            type    : "modularcss",
            plugin  : plugin,
            classes : mapvalues(out, function(val) {
                return unique(val);
            })
        });
    };
});
