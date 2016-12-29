"use strict";

var message = require("../lib/message.js"),

    search = /values-local|values-composed/;

// Find messages from other value plugins & save them to files object
module.exports = (css, result) => {
    var options = message(result, "options"),
        file    = options.files[options.from],
        values  = result.messages
            .filter((msg) => msg.plugin.search(search) > -1)
            .reduce((prev, curr) => Object.assign(prev, curr.values), Object.create(null));
    
    file.values = Object.assign(file.values || Object.create(null), values);
};

module.exports.postcssPlugin = "modular-css-values-export";
