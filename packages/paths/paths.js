"use strict";

var from = require("resolve-from");

module.exports = function(args) {
    var options = Object.assign(
            Object.create(null),
            {
                paths : []
            },
            args
        );
    
    options.paths = options.paths.map((dir) => from.bind(null, dir));

    return (src, file) => {
        var result;

        options.paths.some((fn) =>
            (result = fn(file))
        );
        
        return result;
    };
};
