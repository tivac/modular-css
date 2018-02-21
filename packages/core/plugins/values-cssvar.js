"use strict";

var parser = require("../parsers/parser.js"),
    
    plugin = "modular-css-vars-local";

// Find @value fooga: wooga entries & catalog/remove them
module.exports = (css, result) => {
    var values = Object.create(null);

    css.walkDecls(/--(.+)/, (rule) => {
        if(rule.type !== "decl") {
            return;
        }

        values[rule.prop.substring(2)] = {
            value  : rule.value,
            source : rule.source
        };
    });
    
    if(Object.keys(values).length > 0) {
        result.messages.push({
            type : "modular-css",
            plugin,
            values
        });
    }
};

module.exports.postcssPlugin = plugin;
