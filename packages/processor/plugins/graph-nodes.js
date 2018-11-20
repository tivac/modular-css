"use strict";

const selector = require("postcss-selector-parser");

const parser  = require("../parsers/parser.js");

const plugin = "modular-css-graph-nodes";

module.exports = (css, result) => {
    var externals, current;

    const parse = (rule, value) => {
        const { opts } = result;
        let parsed;

        try {
            parsed = parser.parse(value);
        } catch(e) {
            throw rule.error(e.toString(), {
                word : value.substring(e.location.start.offset, e.location.end.offset),
            });
        }

        if(!parsed.source) {
            return;
        }

        const dependency = opts.resolve(opts.from, parsed.source);

        result.messages.push({
            type : "modular-css",

            plugin,
            dependency,
        });
    };
    
    externals = selector((selectors) =>
        selectors.walkPseudos((pseudo) => {
            // Need to ensure we only process :external pseudos, see #261
            if(pseudo.value !== ":external") {
                return;
            }
            
            parse(current, pseudo.nodes.toString());
        })
    );
    
    // @value <value> from <file>
    css.walkAtRules("value", (rule) => parse(rule, rule.params));

    // { composes: <rule> from <file> }
    css.walkDecls("composes", (rule) => parse(rule, rule.value));

    // :external(<rule> from <file>) { ... }
    // Have to assign to current so postcss-selector-parser can reference the right thing
    // in errors
    css.walkRules(/:external/, (rule) => {
        current = rule;
        
        externals.processSync(rule);
    });
};

module.exports.postcssPlugin = plugin;
