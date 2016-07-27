"use strict";

var map = require("lodash.mapvalues"),

    relative = require("./relative");

exports.join = function(output) {
     return map(
        output,
        function(classes) {
            return classes.join(" ");
        }
    );
};

exports.compositions = function(cwd, processor) {
    var json = {};
    
    Object.keys(processor.files)
        .sort()
        .forEach(function(file) {
            json[relative(cwd, file)] = exports.join(processor.files[file].exports);
        });
    
    return json;
};
