"use strict";

var postcss      = require("postcss"),
    
    Graph   = require("dependency-graph").DepGraph,
    
    _ = {
        unique : require("lodash.uniq"),
        invert : require("lodash.invert"),
        map    : require("lodash.mapvalues")
    },
    
    imports     = require("../_imports"),
    references  = require("../_references"),
    identifiers = require("../_identifiers"),
    
    plugin = "postcss-modular-css-composition",
    global = /global\((.*?)\)/;

module.exports = postcss.plugin(plugin, function() {
    return function(css, result) {
        var refs  = references(css, result),
            map   = _.invert(refs),
            graph = new Graph(),
            opts  = result.opts,
            out   = {},
            parsed;

        // Doing this now because invert doesn't understand arrays
        refs = _.map(refs, function(val, key) {
            var value = [ val ];

            out[key] = value;

            return value;
        });
        
        // Do node addition in a different pass since we can't be sure where the object
        // came from (scoping out, or walking rules)
        Object.keys(refs).forEach(function(key) {
            graph.addNode(key);
        });
        
        // Go look up "composes" declarations and populate dependency graph
        css.walkDecls("composes", function(decl) {
            var selectors;
            
            if(decl.prev()) {
                throw decl.error("composes must be the first declaration in the rule", { word : "composes" });
            }
            
            selectors = identifiers.parse(decl.parent.selector);
            
            if(imports.match(decl.value)) {
                // composes: fooga, wooga from "./some-file.css"
                if(!opts.files) {
                    throw decl.error("Invalid file reference: " + decl.value, { word : decl.value });
                }
                
                parsed = imports.parse(opts.from, decl.value);

                if(!opts.files[parsed.source]) {
                    throw decl.error("Invalid file reference: " + decl.value, { word : decl.value });
                }

                parsed.keys.forEach(function(key) {
                    var meta    = parsed.source + key,
                        details = opts.files[parsed.source];

                    if(!(key in details.compositions)) {
                        throw decl.error("Invalid identifier reference: " + key, { word : key });
                    }

                    refs[meta] = details.compositions[key];
                    graph.addNode(meta);
                    
                    selectors.forEach(function(selector) {
                        graph.addDependency(map[selector], meta);
                    });
                });
            } else {
                // composes: fooga global(wooga)
                decl.value.split(" ").forEach(function(part) {
                    var key = part.trim();

                    if(key.search(global) > -1) {
                        key = key.match(global)[1];
                        
                        if(!key) {
                            throw decl.error("Invalid identifier passed to global()", { word : part });
                        }

                        // Add this to the graph w/o checking it, because we assume
                        // that you did your homework and it'll be fiiiiiiiiiiiiiiine
                        graph.addNode(key);
                        refs[key] = [ key ];
                    } else if(!(key in refs)) {
                        throw decl.error("Unable to find " + key, { word : key });
                    }
                    
                    selectors.forEach(function(selector) {
                        graph.addDependency(map[selector], key);
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
                refs[map[selector]] = [];
                out[map[selector]] = [];
            });
        });

        try {
            // Update out by walking dep graph and updating classes
            graph.overallOrder().forEach(function(selector) {
                graph.dependenciesOf(selector).reverse().forEach(function(dep) {
                    out[selector] = _.unique(refs[dep].concat(out[selector]));
                });
            });
        } catch(e) {
            throw css.error(e.toString());
        }
        
        result.messages.push({
            type         : "modularcss",
            plugin       : plugin,
            compositions : out
        });
    };
});
