"use strict";

const selector = require("postcss-selector-parser");

const parser  = require("../parsers/parser.js");

module.exports = (css, result) => {
    var externals, current;

    const parse = (rule, value) => {
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

        result.messages.push({
            type : "modular-css-graph-nodes",
            file : result.opts.resolve(result.opts.from, parsed.source),
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

module.exports.postcssPlugin = "modular-css-graph-nodes";
