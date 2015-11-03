"use strict";

var path = require("path"),
    
    resolve      = require("resolve"),
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
            lookup  = _.invert(classes),
            graph   = new Graph(),
            options = result.opts,
            output  = {},
            parsed, source;

        // Doing this now because invert doesn't understand arrays
        classes = _.map(classes, function(val, key) {
            var value = [ val ];

            output[key] = value;

            return value;
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
            
            if(imports.match(decl.value)) {
                // composes: fooga, wooga from "./some-file.css"
                if(!options.files) {
                    throw decl.error("Invalid @value reference: " + decl.value, { word : decl.value });
                }
                
                parsed = imports.parse(decl.value);
                source = resolve.sync(parsed.source, { basedir : path.dirname(result.opts.from) });

                parsed.keys.forEach(function(key) {
                    var meta = source + key;

                    if(!(key in options.files[source].classes)) {
                        throw decl.error("Invalid @value reference: " + key, { word : key });
                    }

                    classes[meta] = options.files[source].classes[key];
                    graph.addNode(meta);
                    
                    selectors.forEach(function(selector) {
                        graph.addDependency(lookup[selector], meta);
                    });
                });
            } else {
                // composes: fooga wooga
                decl.value.split(" ").forEach(function(key) {
                    if(!(key in classes)) {
                        throw decl.error("Unable to find " + key, { word : key });
                    }
                    
                    selectors.forEach(function(selector) {
                        graph.addDependency(lookup[selector], key);
                    });
                });
            }
            
            if(decl.parent.nodes.length > 1) {
                return decl.remove();
            }

            // If the parent rule only had the one declaration, clean up the rule
            decl.parent.remove();
            
            // And blank out default for the now-empty class
            selectors.forEach(function(selector) {
                classes[lookup[selector]] = [];
                output[lookup[selector]] = [];
            });
        });

        try {
            // Update output by walking dep graph and updating classes
            graph.overallOrder().forEach(function(selector) {
                graph.dependenciesOf(selector).reverse().forEach(function(dep) {
                    output[selector] = _.unique(classes[dep].concat(output[selector]));
                });
            });
        } catch(e) {
            throw css.error(e.toString());
        }
        
        result.messages.push({
            type         : "modularcss",
            plugin       : plugin,
            compositions : output
        });
    };
});
