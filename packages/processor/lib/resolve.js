"use strict";

const path = require("path");

let resolve;

exports.resolve = (src, file) => {
    if(!resolve) {
        const name = "resolve-from";

        resolve = require(name).silent;
    }

    return resolve(path.dirname(src), file);
};

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
