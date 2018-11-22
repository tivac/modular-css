"use strict";

const parser = require("../parsers/parser.js");

const plugin = "modular-css-values-composed";

// Find @value fooga: wooga entries & catalog/remove them
module.exports = (css, { opts, messages }) => {
    const { files, resolve, from } = opts;
    
    const values = Object.create(null);

    css.walkAtRules("value", (rule) => {
        const parsed = parser.parse(rule.params);

        if(parsed.type !== "composition") {
            return;
        }

        const source = files[resolve(from, parsed.source)];

        parsed.refs.forEach(({ name }) => {
            values[name] = source.values[name];
        });

        rule.remove();
    });
    
    if(Object.keys(values).length > 0) {
        messages.push({
            type : "modular-css",
            
            plugin,
            values,
        });
    }
};

module.exports.postcssPlugin = plugin;
