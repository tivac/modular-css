"use strict";

var postcss    = require("postcss"),
    
    tiered   = require("../lib/graph-tiers.js"),
    relative = require("../lib/relative.js"),
    message  = require("../lib/message.js");

module.exports = (root, result) => {
    var options = message(result, "options"),

        order = tiered(options.graph, { flatten : true, sort : true });
        
    // Run file results through after processor
    return Promise.all(
        order.map((file) => options.after.process(
            options.files[file].result,
            Object.assign(
                Object.create(null),
                options,
                { from : file }
            )
        ))
    )
    // Create a new CSS root & append all files to it in the right order
    .then((results) => {
        root.removeAll();

        results.forEach((output) => {
            // self._warnings(result);

            // Add file path comment
            root.append(postcss.comment({
                text : relative(options.cwd, output.opts.from),
                
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
