"use strict";

const selectorParser = require("postcss-selector-parser");

const atcomposesParser = require("../../parsers/at-composes.js");
const composes = require("../../parsers/composes.js");
const external = require("../../parsers/external.js");
const values = require("../../parsers/values.js");

const identifiers = require("../../lib/identifiers.js");

const type = "modular-css";
const plugin = "modular-css-graph-nodes";

module.exports = (css, { opts, messages }) => {
    const { processor, from } = opts;

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

        if(rule.type !== "decl") {
            messages.push({
                type,
                plugin,
    
                selector : null,
                dependency,
                refs,
            });

            return;
        }
        
        const classes = new Set(identifiers.parse(rule.parent.selector));

        classes.forEach((sel) => messages.push({
            type,
            plugin,

            selector : sel,
            dependency,
            refs,
        }));
    };
    
    // @value <value> from <file>
    css.walkAtRules("value", (rule) => parse(values, rule, rule.params));
    
    // @composes <file>
    css.walkAtRules("composes", (rule) => parse(atcomposesParser, rule, rule.params));

    // { composes: <rule> from <file> }
    css.walkDecls("composes", (rule) => parse(composes, rule, rule.value));

    const externals = selectorParser((selectors) => {
        const found = [];

        selectors.walkPseudos(({ value, nodes }) => {
            // Need to ensure we only process :external pseudos, see #261
            if(value !== ":external") {
                return;
            }

            found.push(nodes.toString());
        });

        return found;
    });

    // :external(<rule> from <file>) { ... }
    css.walkRules(/:external/, (rule) => {
        externals.transformSync(rule).forEach((inner) =>
            parse(external, rule, inner)
        );
    });
};

module.exports.postcssPlugin = plugin;
