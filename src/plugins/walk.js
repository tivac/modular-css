"use strict";

var fs = require("fs"),
    
    message = require("../lib/message.js");

// Walk external references and process through "before" chain
module.exports = (css, result) => {
    var options = message(result, "options"),
        files   = options.files,
        graph   = options.graph;
    
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

        return options.before.process(root || fs.readFileSync(file, "utf8"), Object.assign(
            Object.create(null),
            options,
            {
                from : file,

                // Run parsers in loose mode for this first pass
                strict : false
            }
        ))
        .then((output) => {
            files[file].result = output;

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
    return walk(options.from, css.clone());
};

module.exports.postcssPlugin = "modular-css-walk";
