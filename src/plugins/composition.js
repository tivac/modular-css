"use strict";

var postcss      = require("postcss"),
    
    Graph   = require("dependency-graph").DepGraph,
    
    unique    = require("lodash.uniq"),
    each      = require("lodash.foreach"),
    invert    = require("lodash.invert"),
    mapvalues = require("lodash.mapvalues"),

    composition = require("../_composition"),
    references  = require("../_references"),
    identifiers = require("../_identifiers"),
    
    plugin = "postcss-modular-css-composition";

module.exports = postcss.plugin(plugin, function() {
    return function(css, result) {
        var refs  = references(css, result),
            map   = invert(refs),
            graph = new Graph(),
            opts  = result.opts,
            out   = {},
            empty = {};

        // Have to do this down here because invert doesn't understand array values
        refs = mapvalues(refs, function(val, key) {
            var value = [ val ];

            out[key] = value;

            return value;
        });
        
        // Do node addition in a different pass since we can't be sure where the object
        // came from (scoping msg, or local rules)
        Object.keys(refs).forEach(function(key) {
            graph.addNode(key);
        });

        // Go look up "composes" declarations and populate dependency graph
        css.walkDecls("composes", function(decl) {
            var selectors, details;
            
            if(decl.prev() && decl.prev().prop !== "composes") {
                throw decl.error("composes must be the first declaration in the rule", { word : "composes" });
            }

            selectors = identifiers.parse(decl.parent.selector);
            details   = composition(opts.from, decl.value);

            if(!details) {
                throw decl.error("Unable to parse rule", { word : decl.value });
            }
            
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
                    refs[scoped] = opts.files[details.source].compositions[rule];
                }

                if(!refs[scoped]) {
                    throw decl.error("Invalid composes reference", { word : rule });
                }
            });

            // Remove the composes rule itself
            if(decl.parent.nodes.length > 1) {
                return decl.remove();
            }

            // Mark all selectors for this rule as potentially needing to be purged
            return selectors.forEach(function(selector) {
                empty[selector] = {
                    parent : decl.parent,
                    count  : 0
                };
            });
        });
        
        // Walk all rules pending emptying, remove any that appear > 1 time
        css.walkRules(new RegExp(Object.keys(empty).join("|")), function(rule) {
            identifiers.parse(rule.selector).forEach(function(selector) {
                if(selector in empty) {
                    empty[selector].count++;
                }
            });
        });
        
        each(empty, function(obj, selector) {
            if(obj.count > 1) {
                return;
            }
            
            // If the parent rule only had the one declaration, clean up the rule
            // And blank out output for the now-empty class
            obj.parent.remove();
            
            refs[map[selector]] = [];
            out[map[selector]] = [];
        });

        // Update out by walking dep graph and updating classes
        graph.overallOrder().forEach(function(selector) {
            graph.dependenciesOf(selector).reverse().forEach(function(dep) {
                out[selector] = refs[dep].concat(out[selector]);
            });
        });

        result.messages.push({
            type         : "modularcss",
            plugin       : plugin,
            compositions : mapvalues(out, function(val) {
                return unique(val);
            })
        });
    };
});
