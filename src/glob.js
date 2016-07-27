/* global Promise */
"use strict";

var globule = require("globule"),
    
    Processor = require("./processor.js");

module.exports = function(opts) {
    var options   = opts || {},
        processor = new Processor(options),
        files     = globule.find(options.search, {
            cwd        : options.dir || process.cwd(),
            prefixBase : true
        });
        
    return Promise.all(
        files.map(function(file) {
            return processor.file(file);
        })
    )
    .then(function() {
        return processor;
    });
};
