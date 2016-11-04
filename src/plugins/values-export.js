"use strict";

var postcss = require("postcss"),

    plugin = "postcss-modular-css-values-export",
    search = /values-local|values-composed/;

// Find messages from other value plugins & save them to files object
module.exports = postcss.plugin(plugin, function() {
    return function(css, result) {
        var file   = result.opts.files[result.opts.from],
            values = result.messages
                .filter((msg) => msg.plugin.search(search) > -1)
                .reduce((prev, curr) => Object.assign(prev, curr.values), Object.create(null));
        
        file.values = Object.assign(file.values || Object.create(null), values);
    };
});
