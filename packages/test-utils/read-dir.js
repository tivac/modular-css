"use strict";

const fs = require("fs");
const path = require("path");

const read = require("read-dir-deep");

module.exports = (cwd) =>
    (name) => {
        const dir = path.join(cwd, "./output", name);
        const files = read.sync(dir);

        return files.sort().map((file) => ({
            file : file.replace(/\\/g, "/"),
            text : fs.readFileSync(path.join(dir, file), "utf8"),
        }));
    };
