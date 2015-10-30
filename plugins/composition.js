"use strict";

var postcss      = require("postcss"),
    createParser = require("postcss-selector-parser"),
    
    Graph   = require("dependency-graph").DepGraph,
    
    unique  = require("lodash.uniq"),
    assign  = require("lodash.assign"),
    invert  = require("lodash.invert"),
    
    plugin = "postcss-modular-css-composition";

function findScopedClasses(result) {
    var out;
    
    result.messages.some(function(msg) {
        if(msg.type === "modularcss" && msg.plugin === "postcss-modular-css-scoping" && msg.classes) {
            out = msg.classes;
        }
        
        return out;
    });
    
    if(!out) {
        return {};
    }
    
    // Don't want to futz w/ a different plugin's output...
    return assign({}, out);
}

// TODO: this is probably inefficient, but oh well for now
function identifiers(selector, fn) {
    createParser(function(selectors) {
        selectors.eachClass(fn);
        selectors.eachId(fn);
    }).process(selector);
}

module.exports = postcss.plugin(plugin, function() {
    return function(css, result) {
        var classes = findScopedClasses(result),
            graph   = new Graph(),
            lookup;
        
        if(Object.keys(classes).length === 0) {
            // Walk all identifiers and create lookup object
            css.walkRules(function(rule) {
                identifiers(rule.selector, function(selector) {
                    classes[selector.value] = selector.value;
                });
            });
        }
        
        lookup = invert(classes);
        
        Object.keys(classes).forEach(function(key) {
            graph.addNode(key);
        });
        
        // Go look up all composes uses and generate a dependency graph
        css.walkDecls("composes", function(decl) {
            var selectors = [];
            
            if(decl.prev()) {
                throw decl.error("composes must be the first declaration in the rule", { word : "composes" });
            }
            
            identifiers(decl.parent.selector, function(selector) {
                selectors.push(selector.value);
            });
            
            decl.value.split(" ").forEach(function(id) {
                if(!(id in classes)) {
                    throw decl.error("Unable to find " + id, { word : id });
                }
                
                selectors.forEach(function(selector) {
                    graph.addDependency(lookup[selector], id);
                });
            });
            
            if(decl.parent.nodes.length > 1) {
                return decl.remove();
            }

            // If the parent rule only had the one declaration, clean up the rule
            // And blank out the empty class from the output
            selectors.forEach(function(selector) {
                classes[selector] = "";
            });
            
            return decl.parent.remove();
        });
    
        // Update output by walking dep graph and updating classes
        try {
            graph.overallOrder().forEach(function(selector) {
                classes[selector] = classes[selector] ? [ classes[selector] ] : [];
                    
                graph.dependenciesOf(selector).forEach(function(dep) {
                    classes[selector] = unique(classes[dep].concat(classes[selector]));
                });
            });
        } catch(e) {
            throw css.error(e.toString());
        }
        
        result.messages.push({
            type    : "modularcss",
            plugin  : plugin,
            classes : classes
        });
    };
});
