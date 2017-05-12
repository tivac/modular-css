"use strict";

var parser  = require("../parsers/parser.js"),
    
    plugin = "modular-css-values-composed";

// Find @value fooga: wooga entries & catalog/remove them
module.exports = (css, result) => {
    var values = Object.create(null);

    css.walkAtRules("value", (rule) => {
        var parsed = parser.parse(rule.params),
            source;
        
        if(parsed.type !== "composition") {
            return;
        }

        source = result.opts.files[
            result.opts.resolve(result.opts.from, parsed.source)
        ];

        parsed.refs.forEach((ref) => {
            values[ref.name] = source.values[ref.name];
        });

        rule.remove();
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
