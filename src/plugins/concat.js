"use strict";

var postcss    = require("postcss"),
    sequential = require("sequence-as-promise"),
    
    tiered   = require("../lib/graph-tiers.js"),
    relative = require("../lib/relative.js");

module.exports = (root, result) => {
    var files = result.opts.files,

        order = tiered(result.opts.graph, { flatten : true, sort : true });
        
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
};

module.exports.postcssPlugin = "modular-css-concat";
