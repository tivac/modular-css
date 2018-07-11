"use strict";

const fs = require("fs");
const path = require("path");

const shell = require("shelljs");

module.exports = (cwd) => {
    const write = (name, contents) => {
        const dest = path.join(cwd, name);
        
        shell.mkdir("-p", path.dirname(dest));

        fs.writeFileSync(path.join(cwd, name), contents, "utf8");
    };
    
    write.cwd = cwd;

    return write;
};
