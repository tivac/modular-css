"use strict";

var path = require("path");

module.exports = (prefix) =>
    (str) => path.join(prefix, str);
