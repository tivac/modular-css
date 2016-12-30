"use strict";

var postcss = require("postcss"),

    options = require("../../src/plugins/options.js"),
    setup   = require("../../src/plugins/setup.js");

module.exports = (plugins) => postcss([ options, setup ].concat(plugins));
