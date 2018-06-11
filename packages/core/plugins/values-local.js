"use strict";

const escape = require("escape-string-regexp");

const parser = require("../parsers/parser.js");
    
const plugin = "modular-css-values-local";

// Find @value fooga: wooga entries & catalog/remove them
module.exports = (css, result) => {
    var values = Object.create(null);

    css.walkAtRules("value", (rule) => {
        var parsed;
        
        try {
            parsed = parser.parse(rule.params);
        } catch(e) {
            // Errors aren't world-ending, necessarily
            return;
        }

        const { type } = parsed;

        if(type !== "assignment" && type !== "function") {
            return;
        }

        if(type === "assignment") {
            values[parsed.name] = Object.assign(
                Object.create(null),
                parsed,
                { source : rule.source }
            );
        }

        if(type === "function") {
            values[parsed.name] = Object.assign(
                Object.create(null),
                parsed,
                {
                    search : new RegExp(
                        parsed.args
                            .map((a) => `\\$(${escape(a)})\\b`)
                            .join("|"),
                        "g"
                    ),
                    source : rule.source,
                }
            );
        }

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
