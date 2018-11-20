"use strict";

const map = require("lodash/mapValues");

const relative = require("./relative.js");

exports.join = (output) =>
    map(output, (classes) => (
        Array.isArray(classes) ?
            classes.join(" ") :
            classes.toString()
    ));

exports.compositions = (cwd, processor) => {
    const json = {};
    
    Object.keys(processor.files)
        .sort()
        .forEach((file) =>
            (json[relative(cwd, file)] = exports.join(processor.files[file].exports))
        );
    
    return json;
};
