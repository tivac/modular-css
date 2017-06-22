"use strict";

var search = /values-local|values-composed/;

// Find messages from other value plugins & save them to files object
module.exports = (css, result) => {
    var file   = result.opts.files[result.opts.from],
        values = result.messages
            .filter((msg) => msg.plugin && msg.plugin.search(search) > -1)
            .reduce((prev, curr) => Object.assign(prev, curr.values), Object.create(null));
    
    file.values = Object.assign(file.values || Object.create(null), values);
};

module.exports.postcssPlugin = "modular-css-values-export";
