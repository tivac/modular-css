"use strict";

var map = require("lodash.mapvalues"),

    relative = require("./_relative");

exports.compositions = function(cwd, processor) {
    var json = {};
    
    Object.keys(processor.files).sort().forEach(function(file) {
        json[relative(cwd, file)] = map(
            processor.files[file].compositions,
            function(classes) {
                return classes.join(" ");
            }
        );
    });
    
    return json;
};
