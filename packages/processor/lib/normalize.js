"use strict";

const path = require("path");
const filecase = require("true-case-path");

module.exports = (cwd, file) => {
    if(!path.isAbsolute(file)) {
        file = path.join(cwd, file);
    }

    file = path.normalize(file);

    return filecase(file);
};
