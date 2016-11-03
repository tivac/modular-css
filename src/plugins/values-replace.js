"use strict";

var postcss   = require("postcss"),

    plugin = "postcss-modular-css-replace-values";

module.exports = postcss.plugin(plugin, function() {
    return function(css, result) {
        // TODO: anything
    };
});
