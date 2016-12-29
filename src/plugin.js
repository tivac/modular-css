"use strict";

var postcss  = require("postcss"),
    
    output  = require("./lib/output.js"),
    message = require("./lib/message.js");

module.exports = postcss.plugin("modular-css", () => {
    var processor = postcss();
    
    // Copy result.opts into messages for later use
    processor.use(require("./plugins/options.js"));

    // Add modular-css specific bits to result.opts
    processor.use(require("./plugins/setup.js"));

    // Walk external references and process through "before" chain
    processor.use(require("./plugins/walk.js"));
    
    // Run each file through the transform plugins
    processor.use(require("./plugins/transform.js"));

    // Concat CSS together
    processor.use(require("./plugins/concat.js"));

    // Nice output information
    processor.use((css, result) => {
        var options = message(result, "options");

        result.messages.push({
            type : "modular-css",
            name : "modular-css-exports",
            
            exports : output.compositions(options.cwd, options.files)
        });
    });

    return processor;
});
