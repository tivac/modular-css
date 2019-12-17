"use strict";

const from = require("resolve-from");

module.exports = (args) => {
    const options = {
        __proto__ : null,
        
        paths : [],
        ...args,
    };
    
    return (src, file) => {
        let result;

        options.paths.some((dir) =>
            (result = from.silent(dir, file))
        );

        return result;
    };
};
