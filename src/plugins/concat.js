"use strict";

var postcss    = require("postcss"),
    sequential = require("promise-sequential"),
    
    cloneGraph = require("../lib/clone-graph.js"),
    relative   = require("../lib/relative.js");

module.exports = postcss.plugin("modular-css-concat", () => (root, result) => {
    var files = result.opts.files,

        clone = cloneGraph(result.opts.graph),
        order = [],
        tier;
        
    // Clone the graph and break the graph into tiers that can be sorted
    // to help stabilize output
    while(Object.keys(clone.nodes).length) {
        tier = clone.overallOrder(true);
        
        tier.forEach((node) => {
            clone.dependantsOf(node).forEach(
                (dep) => clone.removeDependency(dep, node)
            );
            
            clone.removeNode(node);
        });
        
        order = order.concat(tier.sort());
    }

    // Run file results through after processor
    return sequential(
        order.map((file) =>
            () => result.opts.after.process(files[file].result, Object.assign(
                Object.create(null),
                result.opts,
                {
                    from : file
                }
            ))
        )
    )
    // Create a new CSS root & append all files to it in the right order
    .then((results) => {
        root.removeAll();

        results.forEach((output) => {
            // self._warnings(result);

            // Add file path comment
            root.append(postcss.comment({
                text : relative(result.opts.cwd, output.opts.from),
                
                // Add a bogus-ish source property so postcss won't make weird-looking
                // source-maps that break the visualizer
                //
                // https://github.com/postcss/postcss/releases/tag/5.1.0
                // https://github.com/postcss/postcss/pull/761
                // https://github.com/tivac/modular-css/pull/157
                //
                source : Object.assign(
                    // Can't use Object.create(null) because PostCSS expects Object.prototype methods
                    {},
                    output.root.source,
                    {
                        end : output.root.source.start
                    }
                )
            }));

            // Add CSS
            root.append(output.root);
        });
    });
});
