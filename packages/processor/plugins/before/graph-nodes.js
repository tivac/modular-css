"use strict";

const selectorParser = require("postcss-selector-parser");

const atcomposesParser = require("../../parsers/at-composes.js");
const composes = require("../../parsers/composes.js");
const external = require("../../parsers/external.js");
const values = require("../../parsers/values.js");

const plugin = "modular-css-graph-nodes";

module.exports = (css, result) => {
    const { opts } = result;

    let current;

    const parse = (parser, rule, value) => {
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

        if(!dependency) {
            throw rule.error(
                `Unable to locate "${parsed.source}" from "${opts.from}"`,
                { word : parsed.source }
            );
        }

        const selector = rule.type === "decl" ?
            rule.parent.selector.slice(1) :
            null;

        result.messages.push({
            type : "modular-css",

            plugin,
            selector,
            dependency,
            refs : parsed.refs,
        });
    };
    
    const externals = selectorParser((selectors) =>
        selectors.walkPseudos(({ value, nodes }) => {
            // Need to ensure we only process :external pseudos, see #261
            if(value !== ":external") {
                return;
            }
            
            parse(external, current, nodes.toString());
        })
    );
    
    // @value <value> from <file>
    css.walkAtRules("value", (rule) => parse(values, rule, rule.params));
    
    // @composes <file>
    css.walkAtRules("composes", (rule) => parse(atcomposesParser, rule, rule.params));

    // { composes: <rule> from <file> }
    css.walkDecls("composes", (rule) => parse(composes, rule, rule.value));

    // :external(<rule> from <file>) { ... }
    // Have to assign to current so postcss-selector-parser can reference the right thing
    // in errors
    css.walkRules(/:external/, (rule) => {
        current = rule;
        
        externals.processSync(rule);
    });
};

module.exports.postcssPlugin = plugin;
