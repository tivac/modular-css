"use strict";

var postcss = require("postcss"),
    hasha   = require("hasha"),
    Graph   = require("dependency-graph").DepGraph,
    unique  = require("lodash.uniq"),
    
    name = "postcss-css-modules";

module.exports = postcss.plugin(name, function(opts) {
    opts = opts || {};
    
    return function(css, result) {
        var classes = {},
            graph   = new Graph(),
            namer   = opts.namer,
            prefix  = opts.prefix;
            
        if(!prefix && !namer) {
            prefix = hasha(css.toString(), { algorithm : "md5" });
        }
        
        if(typeof namer !== "function") {
            namer = function(selector) {
                return prefix + "_" + selector;
            };
        }

        // Walk all classes and save off prefixed selector values
        css.walkRules(/^./, function(rule) {
            rule.selectors.forEach(function(selector) {
                graph.addNode(selector);

                classes[selector] = [ "." + namer(selector.slice(1)) ];
            });
        });
        
        // Go look up all composes uses and generate a dependency graph
        css.walkDecls("composes", function(decl) {
            if(decl.prev()) {
                throw decl.error("composes must be the first declaration in the rule", { word : "composes" });
            }
            
            decl.value.split(" ").forEach(function(id) {
                id = "." + id;

                if(!classes[id]) {
                    throw decl.error("Unable to find " + id, { word : id });
                }

                decl.parent.selectors.forEach(function(selector) {
                    graph.addDependency(selector, id);
                });
            });
            
            // More than one declaration just cleans up the composes: ... decl
            if(decl.parent.nodes.length > 1) {
                return decl.remove();
            }

            // If the parent rule only had the one declaration, clean up the rule
            // And blank out the empty class from the output
            decl.parent.selectors.forEach(function(selector) {
                classes[selector] = [];
            });
            
            return decl.parent.remove();
        });
    
        css.walkRules(/^./, function(rule) {
            rule.selectors.forEach(function(selector) {
                rule.selector = rule.selector.replace(selector, classes[selector][0]);
            });
        });
        
        // Update output by walking dep graph and updating classes
        try {
            graph.overallOrder().forEach(function(selector) {
                graph.dependenciesOf(selector).forEach(function(dep) {
                    classes[selector] = unique(classes[dep].concat(classes[selector]));
                });
            });
        } catch(e) {
            throw css.error(e.toString());
        }
        
        result.messages.push({
            type    : "cssmodules",
            plugin  : name,
            classes : classes
        });
    };
});
