"use strict";

var fs = require("fs"),

    globule    = require("globule"),
    sequential = require("sequence-as-promise"),
    
    plugin = require("./plugin.js");

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
            (prev) => plugin.process(fs.readFileSync(file), options)
        )
    )
    .then((results) => {
        console.log(results);
    });
};
