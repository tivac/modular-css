"use strict";

const path = require("path");
const filecase = require("true-case-path");

module.exports = (cwd, file) => {
    if(!path.isAbsolute(file)) {
        file = path.join(cwd, file);
    }

    file = path.normalize(file);

    // If the file doesn't exist filecase() returns undefined, so in that
    // instance just use whatever was sent
    return filecase(file) || file;
};
