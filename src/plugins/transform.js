"use strict";

var postcss    = require("postcss"),
    sequential = require("sequence-as-promise"),

    tiered = require("../lib/graph-tiers.js"),

    composition = require("./composition.js"),

    // Plugins run to transform a file
    transforms = postcss([
        require("./values-composed.js"),
        require("./values-export.js"),
        require("./values-namespaced.js"),
        require("./values-replace.js"),
        require("./scoping.js"),
        require("./externals.js"),
        require("./composition.js"),
        require("./keyframes.js")
    ]);

function transformer(opts, files, file) {
    return transforms.process(files[file].result, Object.assign(
        Object.create(null),
        opts,
        {
            from : file
        }
    ))
    .then((output) => {
        files[file].result = output;
        
        files[file].exports = output.messages.find((msg) =>
            msg.plugin === composition.postcssPlugin
        ).classes;
    });
}

module.exports = (css, result) => {
    var graph = result.opts.graph,
        files = result.opts.files,
        
        tiers = tiered(graph);
    
    // FUCK FUCK FUCK FUCK FUCK FUCK FUCK FUCK FUCK
    return sequential(
        tiers.map((tier) =>
            () => Promise.all(
                tier
                .filter((file) => !files[file].exports)
                .map((file) => transformer(result.opts, files, file))
            )
        )
    );
};

module.exports.postcssPlugin = "modular-css-transform";
