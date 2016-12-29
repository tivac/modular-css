"use strict";

var plugin = "modular-css-options";

module.exports = (css, result) => {
    result.messages.push({
        type : "modular-css",
        plugin,
        
        options : Object.assign(
            Object.create(null),
            result.opts
        )
    });
};

module.exports.postcssPlugin = plugin;
