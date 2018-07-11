"use strict";

var fs = require("fs"),
    path = require("path");

module.exports = (cwd) => {
    const read = (name) =>
        fs.readFileSync(path.join(cwd, name), "utf8");
    
    read.cwd = cwd;

    return read;
};
