"use strict";

var parser  = require("../parsers/parser.js"),
    
    plugin = "modular-css-values-namespaced";

// Find @value * as fooga from "./wooga.css" entries & catalog/remove them
module.exports = (css, result) => {
    var values = Object.create(null);

    css.walkAtRules("value", (rule) => {
        var parsed = parser.parse(rule.params),
            source;
        
        /* istanbul ignore if */
        if(parsed.type !== "namespace") {
            return;
        }

        source = result.opts.files[
            result.opts.resolve(result.opts.from, parsed.source)
        ];

        values[parsed.name] = source.values;

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
