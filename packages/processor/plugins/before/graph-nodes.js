"use strict";

const selectorParser = require("postcss-selector-parser");

const atcomposesParser = require("../../parsers/at-composes.js");
const composes = require("../../parsers/composes.js");
const external = require("../../parsers/external.js");
const values = require("../../parsers/values.js");

const type = "modular-css";
const plugin = "modular-css-graph-nodes";

module.exports = (css, { opts, messages }) => {
    const { processor, from } = opts;

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

        const { source, refs } = parsed;

        const dependency = processor.resolve(from, source);

        if(!dependency) {
            throw rule.error(
                `Unable to locate "${source}" from "${from}"`,
                { word : source }
            );
        }

        const selector = rule.type === "decl" ?
            rule.parent.selector.slice(1) :
            null;

        messages.push({
            type,
            plugin,

            selector,
            dependency,
            refs,
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
