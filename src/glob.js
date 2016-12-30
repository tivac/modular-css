"use strict";

var fs = require("fs"),

    globule    = require("globule"),
    sequential = require("promise-sequential"),
    
    plugin  = require("./plugin.js"),
    message = require("./lib/message.js");

module.exports = function(opts) {
    var options = Object.assign(
            Object.create(null),
            {
                search : [
                    "**/*.css"
                ]
            
            },
            /* istanbul ignore next */
            opts || {}
        );
        
    return sequential(
        globule.find({
            src        : options.search,
            cwd        : options.cwd || process.cwd(),
            prefixBase : true
        })
        .map((file) =>
            (result) => {
                var prev = message(result, "options");

                return plugin.process(
                    fs.readFileSync(file),
                    Object.assign(
                        Object.create(null),
                        options,
                        {
                            from  : file,
                            files : prev.files,
                            graph : prev.graph
                        }
                    )
                );
            }
        )
    )
    .then((results) => results.pop());
};
