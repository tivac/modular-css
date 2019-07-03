"use strict";

const parser = require("../parsers/values.js");

const plugin = "modular-css-values-namespaced";

// Find @value * as fooga from "./wooga.css" entries & catalog/remove them
module.exports = (css, { opts, messages }) => {
    const { files, resolve, from } = opts;
    
    const values = Object.create(null);

    css.walkAtRules("value", (rule) => {
        const parsed = parser.parse(rule.params);

        /* istanbul ignore if */
        if(parsed.type !== "namespace") {
            return;
        }

        const source = files[resolve(from, parsed.source)];

        values[parsed.name] = source.values;

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
