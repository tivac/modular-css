"use strict";

var postcss    = require("postcss"),
    sequential = require("sequence-as-promise"),

    // Plugins run to transform a file
    transform = postcss([
        require("./values-composed.js"),
        require("./values-export.js"),
        require("./values-namespaced.js"),
        require("./values-replace.js"),
        require("./scoping.js"),
        require("./externals.js"),
        require("./composition.js"),
        require("./keyframes.js")
    ]);

module.exports = postcss.plugin("modular-css-transform", () => (css, result) => {
    var graph = result.opts.graph,
        files = result.opts.files;
    
    // FUCK FUCK FUCK FUCK FUCK FUCK FUCK FUCK FUCK
    return sequential(graph.overallOrder()
        .filter((file) => !files[file].exports)
        .map((file) =>
            () => transform.process(files[file].result, Object.assign(
                Object.create(null),
                result.opts,
                {
                    from : file
                }
            ))
            .then((output) => {
                files[file].result = output;
                
                files[file].exports = output.messages.find((msg) =>
                    msg.plugin === "postcss-modular-css-composition"
                ).classes;
            })
        )
    );
});
