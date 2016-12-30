"use strict";

var map = require("lodash.mapvalues"),

    relative = require("./relative");

exports.join = function(output) {
    return map(output, (classes) => classes.join(" "));
};

exports.compositions = function(cwd, files) {
    var json = {};
    
    Object.keys(files)
        .sort()
        .forEach((file) =>
            (json[relative(cwd, file)] = exports.join(files[file].exports))
        );
    
    return json;
};
