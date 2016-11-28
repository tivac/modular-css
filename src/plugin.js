"use strict";

var fs = require("fs"),
    
    postcss = require("postcss"),
    Graph   = require("dependency-graph").DepGraph;

module.exports = postcss.plugin("modular-css", (opts) => {
    var processor = postcss(),
        
        // Plugins to run before a file is fully-processed
        before = postcss((opts.before || []).concat([
            require("./plugins/values-local.js"),
            require("./plugins/values-export.js"),
            require("./plugins/values-replace.js"),
            require("./plugins/graph-nodes.js")
        ])),
        
        // Plugins run to transform a file
        transform = postcss([
            require("./plugins/values-composed.js"),
            require("./plugins/values-export.js"),
            require("./plugins/values-namespaced.js"),
            require("./plugins/values-replace.js"),
            require("./plugins/scoping.js"),
            require("./plugins/externals.js"),
            require("./plugins/composition.js"),
            require("./plugins/keyframes.js")
        ]),
        
        // Plugins run after a file has been transformed
        after = postcss(opts.after || [
            require("postcss-url")
        ]);

    // Set up the main processor
    processor.use((css, result) => {
        result.opts = Object.assign(
            Object.create(null),
            result.opts,
            {
                graph : new Graph(),
                files : Object.create(null)
            }
        );
    });

    // Walk external references and process through "before" chain
    processor.use((css, result) => {
        var files = result.opts.files,
            graph = result.opts.graph;
        
        function walk(file) {
            var text;
            
            // No need to re-process files
            if(files[file]) {
                return Promise.resolve();
            }

            text = fs.readFileSync(file, "utf8");

            graph.addNode(file);

            files[file] = {
                exports : false,
                values  : false
            };

            return before.process(text, Object.assign(
                Object.create(null),
                result.opts,
                {
                    from  : file,
                    graph : graph,
                    files : files,

                    // Run parsers in loose mode for this first pass
                    strict : false
                }
            ))
            .then((result) => {
                files[file].result = result;

                // Check for plugin warnings
                // warnings(result);
                
                // Walk this node's dependencies, reading new files from disk as necessary
                return Promise.all(
                    graph.dependenciesOf(file).map((dependency) => walk(
                        dependency
                    ))
                );
            });
        }

        return walk(result.opts.from);
    });
    
    // TODO: Concatenate output ASTs together
    // See processor.output
    processor.use((css, result) => {

    });

    // TODO: Run combined output through the rest of the plugins?

    if(opts.after) {
        if(Array.isArray(opts.after)) {
            opts.after.map(processor.use);
        } else {
            processor.use(opts.after);
        }
    }

    return processor;
});
