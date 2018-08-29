"use strict";

var path = require("path"),

    resolve = require("resolve-from").silent,
    fixCase = require("true-case-path");

exports.resolve = (src, file) =>
    resolve(path.dirname(src), file);

exports.resolvers = (resolvers) => {
    resolvers.push(exports.resolve);
    
    return (src, file) => {
        var result;

        resolvers.some((fn) =>
            (result = fn(src, file, exports.resolve))
        );
        
        if(!result) {
            throw new Error(`Unable to locate "${file}" from "${src}"`);
        }

        return fixCase(result);
    };
};
