"use strict";

const path = require("path");
const resolve = require("resolve-from").silent;

exports.resolve = (src, file) => resolve(path.dirname(src), file);

exports.resolvers = (resolvers) => {
    resolvers.push(exports.resolve);
    
    return (src, file) => {
        let result;

        resolvers.some((fn) =>
            (result = fn(src, file, exports.resolve))
        );
        
        return result;
    };
};
