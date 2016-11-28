"use strict";

var fs = require("fs"),

    postcss = require("postcss");

// Walk external references and process through "before" chain
module.exports = postcss.plugin("modular-css-walk", () => (root, result) => {
    var files = result.opts.files,
        graph = result.opts.graph;
    
    function walk(file, root) {
        // No need to re-process files
        if(files[file]) {
            return Promise.resolve();
        }

        graph.addNode(file);

        files[file] = {
            exports : false,
            values  : false
        };

        return result.opts.before.process(root || fs.readFileSync(file, "utf8"), Object.assign(
            Object.create(null),
            result.opts,
            {
                from : file,

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

    // Pass a clone to avoid weird referential stuff later
    return walk(result.opts.from, root.clone());
});
