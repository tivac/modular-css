"use strict";

const parser = require("../parsers/at-composes.js");

const plugin = "modular-css-at-composes";

module.exports = (css, { opts, messages }) => {
    const { files, resolve, from } = opts;
        
    let source;

    css.walkAtRules("composes", (rule) => {
        if(source) {
            throw rule.error(`Only one @composes rule per file`, { word : "composes" });
        }

        // We know it's safe, otherwise it would have failed in graph-nodes pass
        const parsed = parser.parse(rule.params);

        source = files[resolve(from, parsed.source)];

        // Remove the @composes from the output
        rule.remove();
    });

    if(!source) {
        return;
    }

    messages.push({
        type : "modular-css",
        plugin,

        atcomposes : source.exports,
    });
};

module.exports.postcssPlugin = plugin;
