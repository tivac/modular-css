"use strict";

var postcss = require("postcss"),
    hasha   = require("hasha"),
    Graph   = require("dependency-graph").DepGraph;

module.exports = postcss.plugin("postcss-css-modules", function(opts) {
    opts = opts || false;

    return function(css, result) {
        var classes = {},
            graph   = new Graph();

        if(!opts.path) {
            opts.path = hasha(css.toString(), { algorithm : "md5" });
        }

        // Go grab all classes, before they were transformed
        css.walkRules(/^./, function(rule) {
            rule.selectors.forEach(function(selector) {
                graph.addNode(selector);

                classes[selector] = "." + opts.path + "_" + selector.slice(1);
            });
        });

        console.log(classes); // TODO: REMOVE DEBUGGING

        // Go look up all composes uses and rewrite
        css.walkDecls("composes", function(decl) {
            var composed = decl.value.split(" ");

            composed.forEach(function(id) {
                id = "." + id;

                if(!classes[id]) {
                    return result.warn("Unable to find " + id, {
                        node : decl,
                        word : id
                    });
                }

                decl.parent.selectors.forEach(function(parent) {
                    graph.addDependency(parent, id);
                });
            });
            

            // If the rule only had the one declaration, clean up the rule
            // And remove the empty class from the output
            if(decl.parent.nodes.length === 1) {
                decl.parent.selectors.forEach(function(selector) {
                    classes[selector] = "";
                });
                
                decl.parent.remove();
            } else {
                // otherwise just remove the declaration
                decl.remove();
            }
        });

        console.log(graph.overallOrder()); // TODO: REMOVE DEBUGGING

        graph.overallOrder().forEach(function(node) {
            graph.dependenciesOf(node).forEach(function(dep) {
                classes[node] = classes[node] ? classes[dep] + " " + classes[node] : classes[dep];
            });
        });
        
        console.log(classes); // TODO: REMOVE DEBUGGING
    };
});
