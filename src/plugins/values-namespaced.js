"use strict";

var parser  = require("../parsers/parser.js"),
    resolve = require("../lib/resolve.js"),
    message = require("../lib/message.js"),
    
    plugin = "modular-css-values-namespaced",
    offset = "@value ".length;

// Find @value fooga: wooga entries & catalog/remove them
module.exports = (css, result) => {
    var options = message(result, "options"),
        values  = Object.create(null);

    css.walkAtRules("value", (rule) => {
        var parsed, source;

        try {
            parsed = parser.parse(rule.params);
        } catch(e) {
            throw rule.error(e.toString(), { index : offset + e.location.start.column });
        }

        if(parsed.type !== "namespace") {
            return;
        }

        try {
            source = options.files[resolve(options.from, parsed.source)];
        } catch(e) {
            // NO-OP
        }

        if(!source) {
            throw rule.error("Unknown composition source", { word : parsed.source });
        }

        values[parsed.name] = source.values;

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
