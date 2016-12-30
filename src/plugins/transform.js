"use strict";

var postcss    = require("postcss"),
    sequential = require("promise-sequential"),

    tiered  = require("../lib/graph-tiers.js"),
    message = require("../lib/message.js"),

    composition = require("./composition.js"),

    // Plugins run to transform a file
    plugins = postcss([
        require("./options.js"),
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
    var options = message(result, "options"),
        graph   = options.graph,
        files   = options.files,
        
        tiers = tiered(graph);
    
    // FUCK FUCK FUCK FUCK FUCK FUCK FUCK FUCK FUCK
    return sequential(
        tiers.map((tier) =>
            () => Promise.all(
                tier
                .filter((file) => !files[file].exports)
                .map((file) =>
                    plugins.process(files[file].result, Object.assign(
                        options,
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
