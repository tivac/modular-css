"use strict";

var Graph = require("dependency-graph").DepGraph,
    
    unique    = require("lodash.uniq"),
    invert    = require("lodash.invert"),
    mapvalues = require("lodash.mapvalues"),

    message     = require("../lib/message.js"),
    resolve     = require("../lib/resolve.js"),
    identifiers = require("../lib/identifiers.js"),
    
    parser = require("../parsers/parser.js"),
    
    plugin = "modular-css-composition";

module.exports = (css, result) => {
    var refs  = message(result, "classes"),
        map   = invert(refs),
        opts  = result.opts,
        graph = new Graph(),
        out   = Object.assign(Object.create(null), refs);
    
    Object.keys(refs).forEach(function(key) {
        graph.addNode(key);
    });

    // Go look up "composes" declarations and populate dependency graph
    css.walkDecls("composes", function(decl) {
        var selectors, details;

        if(decl.prev() && decl.prev().prop !== "composes") {
            throw decl.error("composes must be the first declaration", { word : "composes" });
        }
        
        try {
            details   = parser.parse(decl.value);
            selectors = identifiers.parse(decl.parent.selector);
        } catch(e) {
            throw decl.error(e.toString(), { word : decl.value });
        }

        if(details.source) {
            details.source = resolve(opts.from, details.source);

            if(!opts.files || !opts.files[details.source]) {
                throw decl.error("Invalid file reference", { word : decl.value });
            }
        }

        // Add references and update graph
        details.refs.forEach((ref) => {
            var scoped;
                
            if(ref.global) {
                scoped = "global-" + ref.name;
            } else {
                scoped = (details.source ? details.source + "-" : "") + ref.name;
            }

            graph.addNode(scoped);

            selectors.forEach(function(selector) {
                graph.addDependency(map[selector], scoped);
            });

            if(ref.global) {
                refs[scoped] = [ ref.name ];

                return;
            }

            if(details.source) {
                refs[scoped] = opts.files[details.source].exports[ref.name];
            }

            if(!refs[scoped]) {
                throw decl.error("Invalid composes reference", { word : ref.name });
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
        graph.dependenciesOf(selector)
            .reverse()
            .forEach(function(dep) {
                out[selector] = refs[dep].concat(out[selector]);
            });
    });

    result.messages.push({
        type    : "modular-css",
        plugin  : plugin,
        classes : mapvalues(out, function(val) {
            return unique(val);
        })
    });
};

module.exports.postcssPlugin = plugin;
