"use strict";

var path = require("path"),
    
    postcss  = require("postcss"),
    Graph    = require("dependency-graph").DepGraph,
    slug     = require("unique-slug"),
    defaults = require("lodash.defaults"),
    
    output   = require("./lib/output.js"),
    relative = require("./lib/relative.js");

function namer(cwd, file, selector) {
    return "mc" + slug(relative(cwd, file)) + "_" + selector;
}

module.exports = postcss.plugin("modular-css", (opts) => {
    var processor = postcss(),
        
        cwd = opts.cwd || process.cwd();

    // Add modular-css specific bits to result.opts
    processor.use((css, result) => {
        result.opts = defaults(
            Object.create(null),
            result.opts,
            {
                graph : new Graph(),
                files : Object.create(null),
                cwd   : cwd,
                
                // Naming function
                namer : typeof opts.namer === "function" ?
                    opts.namer :
                    namer.bind(null, cwd)
            }
        );
                
        // Plugins to run before a file is processed
        result.opts.before = postcss((opts.before || []).concat([
            require("./plugins/values-local.js"),
            require("./plugins/values-export.js"),
            require("./plugins/values-replace.js"),
            require("./plugins/graph-nodes.js")
        ]));

        // Plugins to run after a file has been transformed
        result.opts.after = postcss(opts.after || [
            require("postcss-url")
        ]);

        result.opts.from = path.resolve(result.opts.from);
    });

    // Walk external references and process through "before" chain
    processor.use(require("./plugins/walk.js"));
    
    // Run each file through the transform plugins
    processor.use(require("./plugins/transform.js"));

    // Concat CSS together
    processor.use(require("./plugins/concat.js"));

    // Nice output information
    processor.use((css, result) => {
        result.messages.push({
            type : "modular-css",
            name : "modular-css",
            
            exports : output.compositions(result.opts.cwd, result.opts.files)
        });
    });

    return processor;
});
