"use strict";

var path = require("path"),

    postcss      = require("postcss"),
    createParser = require("postcss-selector-parser"),
    
    Graph   = require("dependency-graph").DepGraph,
    
    _ = {
        unique : require("lodash.uniq"),
        assign : require("lodash.assign"),
        invert : require("lodash.invert"),
        map    : require("lodash.mapvalues")
    },
    
    imports = require("../imports"),
    
    plugin = "postcss-modular-css-composition";

// TODO: this is probably inefficient, but oh well for now
function identifiers(selector) {
    var values = [];
    
    createParser(function(selectors) {
        selectors.eachClass(function(part) {
            values.push(part.value);
        });
        
        selectors.eachId(function(part) {
            values.push(part.value);
        });
    }).process(selector);
    
    return values;
}

function findScopedClasses(css, result) {
    var out;
    
    result.messages.some(function(msg) {
        if(msg.plugin === "postcss-modular-css-scoping" && msg.classes) {
            out = msg.classes;
        }
        
        return out;
    });
    
    if(out) {
        // Don't want to futz w/ a different plugin's output...
        return _.assign({}, out);
    }
    
    // Scoping plugin hasn't run, generate ourselves
    out = {};
    
    css.walkRules(function(rule) {
        identifiers(rule.selector).forEach(function(identifier) {
            out[identifier] = identifier;
        });
    });
    
    return out;
}

module.exports = postcss.plugin(plugin, function() {
    return function(css, result) {
        var classes = findScopedClasses(css, result),
            graph   = new Graph(),
            options = result.opts,
            lookup, parsed, source;
            
        lookup  = _.invert(classes);
        classes = _.map(classes, function(val) {
            return [ val ];
        });
        
        // Do node addition in a different pass since we can't be sure where the object
        // came from (scoping output, or walking rules)
        Object.keys(classes).forEach(function(key) {
            graph.addNode(key);
        });
        
        // Go look up "composes" declarations and populate dependency graph
        css.walkDecls("composes", function(decl) {
            var selectors;
            
            if(decl.prev()) {
                throw decl.error("composes must be the first declaration in the rule", { word : "composes" });
            }
            
            selectors = identifiers(decl.parent.selector);
            
            if(decl.value.search(imports.format) > -1) {
                // composes: fooga, wooga from "./some-file.css"
                if(!options.files || !options.root) {
                    throw decl.error("Invalid @value reference", { word : decl.value });
                }
                
                parsed = imports.parse(decl.value);
                source = options.files[path.resolve(options.root, parsed.source)];
                
                parsed.keys.forEach(function(key) {
                    if(!(key in source.classes)) {
                        throw decl.error("Invalid @value reference", { word : key });
                    }
                    
                    selectors.forEach(function(selector) {
                        classes[lookup[selector]] = source.classes[key].concat(classes[lookup[selector]]);
                    });
                });
            } else {
                console.log(decl.value, decl.value.split(" "));
                
                // composes: fooga wooga
                decl.value.split(" ").forEach(function(id) {
                    if(!(id in classes)) {
                        throw decl.error("Unable to find " + id, { word : id });
                    }
                    
                    selectors.forEach(function(selector) {
                        graph.addDependency(lookup[selector], id);
                    });
                });
            }
            
            if(decl.parent.nodes.length > 1) {
                return decl.remove();
            }

            // If the parent rule only had the one declaration, clean up the rule
            decl.parent.remove();
            
            // And blank out the empty class from the output
            selectors.forEach(function(selector) {
                classes[selector] = false;
            });
        });

        try {
            // Update output by walking dep graph and updating classes
            graph.overallOrder().forEach(function(selector) {
                graph.dependenciesOf(selector).forEach(function(dep) {
                    classes[selector] = classes[selector] ?
                        _.unique(classes[dep].concat(classes[selector])) :
                        classes[dep];
                });
            });
        } catch(e) {
            throw css.error(e.toString());
        }
        
        result.messages.push({
            type         : "modularcss",
            plugin       : plugin,
            compositions : classes
        });
    };
});
