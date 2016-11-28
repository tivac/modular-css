"use strict";

var postcss = require("postcss"),
    Graph   = require("dependency-graph").DepGraph,
    slug    = require("unique-slug"),
    
    output   = require("./lib/output.js"),
    relative = require("./lib/relative.js");

function namer(cwd, file, selector) {
    return "mc" + slug(relative(cwd, file)) + "_" + selector;
}

module.exports = postcss.plugin("modular-css", (opts) => {
    var processor = postcss(),
        
        cwd = opts.cwd || process.cwd();

    // Set up the main processor
    processor.use((css, result) => {
        result.opts = Object.assign(
            Object.create(null),
            result.opts,
            {
                graph : new Graph(),
                files : Object.create(null),
                cwd   : cwd,
                
                // Plugins to run before a file is processed
                before : postcss((opts.before || []).concat([
                    require("./plugins/values-local.js"),
                    require("./plugins/values-export.js"),
                    require("./plugins/values-replace.js"),
                    require("./plugins/graph-nodes.js")
                ])),

                // Plugins to run after a file has been transformed
                after : postcss(opts.after || [
                    require("postcss-url")
                ]),

                // Naming function
                namer : typeof opts.namer === "function" ?
                    opts.namer :
                    namer.bind(null, cwd)
            }
        );
    });

    // Walk external references and process through "before" chain
    processor.use(require("./plugins/walk.js"));
    
    // Run each file through the transform plugins
    processor.use(require("./plugins/transform.js"));

    // Concat CSS together
    processor.use(require("./plugins/concat.js"));

    // Store output compositions
    processor.use((css, result) => {
        result.messages.push({
            type : "modularcss",
            name : "modular-css-compositions",
            
            compositions : output.compositions(result.opts.cwd, result.opts.files)
        });
    });

    return processor;
});
