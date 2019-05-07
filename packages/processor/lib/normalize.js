"use strict";

const path = require("path");

module.exports = (cwd, file) => {
    if(!path.isAbsolute(file)) {
        file = path.join(cwd, file);
    }
    
    return path.normalize(file);
};
