"use strict";

var globule = require("globule"),
    
    Processor = require("modular-css-core");

module.exports = function(opts) {
    var options = Object.assign(
            Object.create(null),
            {
                search : [ "**/*.css" ],
            },
            opts || {}
        ),
        processor = new Processor(options);
    
    return Promise.all(
        globule.find({
            src        : options.search,
            cwd        : processor.options.cwd,
            prefixBase : true,
        })
        .map((file) => processor.file(file))
    )
    .then(() => processor);
};
