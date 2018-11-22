"use strict";

const path = require("path");
const resolve = require("resolve-from").silent;
const pathcase = require("true-case-path");

exports.resolve = (src, file) => resolve(path.dirname(src), file);

exports.resolvers = (resolvers) => {
    resolvers.push(exports.resolve);
    
    return (src, file) => {
        let result;

        resolvers.some((fn) =>
            (result = fn(src, file, exports.resolve))
        );
        
        if(!result) {
            throw new Error(`Unable to locate "${file}" from "${src}"`);
        }

        return pathcase(result);
    };
};
