"use strict";

const parser = require("../parsers/parser.js");

const plugin = "modular-css-values-composed";

// Find @value fooga: wooga entries & catalog/remove them
module.exports = (css, result) => {
    const values = Object.create(null);

    css.walkAtRules("value", (rule) => {
        const parsed = parser.parse(rule.params);

        if(parsed.type !== "composition") {
            return;
        }

        const source = result.opts.files[
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
            values,
        });
    }
};

module.exports.postcssPlugin = plugin;
