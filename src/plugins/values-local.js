"use strict";

var parser = require("../parsers/parser.js"),
    
    plugin = "modular-css-values-local",
    offset = "@value ".length;

// Find @value fooga: wooga entries & catalog/remove them
module.exports = (css, result) => {
    var values = Object.create(null);

    css.walkAtRules("value", (rule) => {
        var parsed;
        
        try {
            parsed = parser.parse(rule.params);
        } catch(e) {
            if(result.opts.strict) {
                throw rule.error(e.toString(), { index : offset + e.location.start.column });
            } else {
                return;
            }
        }

        if(parsed.type !== "assignment") {
            return;
        }

        values[parsed.name] = {
            value  : parsed.value,
            source : rule.source
        };

        rule.remove();
    });
    
    if(Object.keys(values).length > 0) {
        result.messages.push({
            type : "modularcss",
            plugin,
            values
        });
    }
};

module.exports.postcssPlugin = plugin;
