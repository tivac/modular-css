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

module.exports = postcss.plugin("modular-css", () => {
    var processor = postcss();
    
    // Add modular-css specific bits to result.opts
    processor.use((css, result) => {
        var cwd = result.opts.cwd || process.cwd();

        result.opts = defaults(
            Object.create(null),
            result.opts,
            {
                cwd   : cwd,
                graph : new Graph(),
                files : Object.create(null),
                namer : namer.bind(null, cwd)
            }
        );
                
        // Plugins to run before a file is processed
        result.opts.before = postcss((result.opts.before || []).concat([
            require("./plugins/values-local.js"),
            require("./plugins/values-export.js"),
            require("./plugins/values-replace.js"),
            require("./plugins/graph-nodes.js")
        ]));

        // Plugins to run after a file has been transformed
        result.opts.after = postcss(result.opts.after || [
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
            name : "modular-css-exports",
            
            exports : output.compositions(result.opts.cwd, result.opts.files)
        });
    });

    return processor;
});
