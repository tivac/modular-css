"use strict";

var postcss = require("postcss"),

    parser = require("../parsers/values.js"),
    
    plugin = "postcss-modular-css-values-local",
    offset = "@value ".length;

// Find @value fooga: wooga entries & catalog/remove them
module.exports = postcss.plugin(plugin, function() {
    return function(css, result) {
        var values = Object.create(null);

        css.walkAtRules("value", (rule) => {
            var parsed;
            
            try {
                 parsed = parser.parse(rule.params);
            } catch(e) {
                throw rule.error(e.toString(), { index : offset + e.location.start.column });
            }

            if(parsed.type !== "assignment") {
                return false;
            }

            values[parsed.name] = {
                value  : parsed.value,
                source : rule.source
            };

            return rule.remove();
        });
        
        if(Object.keys(values).length > 0) {
            result.messages.push({
                type : "modularcss",
                plugin,
                values
            });
        }
    };
});
