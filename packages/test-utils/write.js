"use strict";

const fs = require("fs");
const path = require("path");

const shell = require("shelljs");

module.exports = (cwd) =>
    (name, contents) => {
        const dest = path.join(cwd, "./output", name);
        
        shell.mkdir("-p", path.dirname(dest));

        fs.writeFileSync(dest, contents, "utf8");
    };
