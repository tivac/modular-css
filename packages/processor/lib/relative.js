"use strict";

const path = require("path");
const sepRegex = /\\/g;

// Get a relative version of an absolute path w/ cross-platform/URL-friendly
// directory separators
module.exports = (cwd, file) => {
    const result = path.relative(cwd, file).replace(sepRegex, "/");

    return `${!path.isAbsolute(result) ? "./" : ""}${result}`;
};
