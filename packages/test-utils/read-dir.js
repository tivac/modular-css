"use strict";

const fs = require("fs");
const path = require("path");

const { readDirDeepSync : read } = require("read-dir-deep");

module.exports = (cwd) =>
    (name) => {
        const dir = path.join(cwd, "./output", name);
        const files = read(dir);

        return files.sort().reduce((out, file) => {
            out[file.replace(/\\/g, "/")] = fs.readFileSync(path.join(dir, file), "utf8");

            return out;
        }, Object.create(null));
    };
