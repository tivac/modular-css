"use strict";

const parser = require("../parsers/values.js");

const plugin = "modular-css-values-imported";

// Find @value * from "./wooga.css" entries & catalog/remove them
module.exports = (css, { opts, messages }) => {
    const { files, resolve, from } = opts;
    
    let values = Object.create(null);

    css.walkAtRules("value", (rule) => {
        const parsed = parser.parse(rule.params);

        /* istanbul ignore if */
        if(parsed.type !== "import") {
            return;
        }

        const source = files[resolve(from, parsed.source)];

        values = Object.assign(values, source.values);

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
