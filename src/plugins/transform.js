"use strict";

var postcss    = require("postcss"),
    sequential = require("sequence-as-promise"),

    tiered = require("../lib/graph-tiers.js"),

    composition = require("./composition.js"),

    // Plugins run to transform a file
    plugins = postcss([
        require("./values-composed.js"),
        require("./values-export.js"),
        require("./values-namespaced.js"),
        require("./values-replace.js"),
        require("./scoping.js"),
        require("./externals.js"),
        require("./composition.js"),
        require("./keyframes.js")
    ]);

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
                .map((file) =>
                    plugins.process(files[file].result, Object.assign(
                        Object.create(null),
                        result.opts,
                        {
                            from : file
                        }
                    ))
                    .then((output) => {
                        files[file].result = output;
                        
                        files[file].exports = output.messages.find((msg) =>
                            msg.plugin === composition.postcssPlugin
                        ).classes;
                    })
                )
            )
        )
    );
};

module.exports.postcssPlugin = "modular-css-transform";
