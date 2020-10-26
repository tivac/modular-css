"use strict";

const parser = require("../parsers/values.js");

const plugin = "modular-css-values-import";

// Find @value entries & catalog/remove them
module.exports = (css, { opts }) => {
    const { from, processor } = opts;
    const target = processor.files[from];

    const changes = [];

    // eslint-disable-next-line max-statements
    css.walkAtRules("value", (rule) => {
        const parsed = parser.parse(rule.params);
        const file = processor.resolve(from, parsed.source);
        const values = { __proto__ : null };
        const source = processor.files[file];

        rule.remove();

        // fooga from "./wooga"
        if(parsed.type === "composition") {
            parsed.refs.forEach(({ name }) => {
                const value = source.values[name];

                if(!value) {
                    throw rule.error(`Could not find @value ${name} in "${parsed.source}"`);
                }

                const sourceKey = processor._addValue(file, name);
                const nameKey = processor._addValue(from, name);

                processor.graph.addDependency(nameKey, sourceKey);

                values[name] = {
                    ...value,
                    external : true,
                };
            });

            return changes.push(values);
        }

        // * as fooga from "./wooga"
        if(parsed.type === "namespace") {
            processor._addValue(file, parsed.name, { namespace : true });

            for(const key in source.values) {
                const name = `${parsed.name}.${key}`;

                values[name] = {
                    ...source.values[key],
                    external : true,
                };
            }

            return changes.push(values);
        }

        // fooga as wooga from "./booga"
        if(parsed.type === "alias") {
            const [{ name }] = parsed.refs;
            const value = source.values[name];

            if(!value) {
                throw rule.error(`Could not find @value ${name} in "${parsed.source}"`);
            }

            const sourceKey = processor._addValue(file, name);
            const aliasKey = processor._addValue(from, parsed.alias, { alias : name });

            processor.graph.addDependency(aliasKey, sourceKey);

            values[parsed.alias] = {
                ...value,
                external : true,
            };

            return changes.push(values);
        }

        // * from "./wooga"
        // istanbul ignore else: This is worthwhile in case we add a new type to the parser
        if(parsed.type === "import") {
            return changes.push(source.values);
        }

        // istanbul ignore next: This is worthwhile in case we add a new type to the parser
        throw rule.error(`Unknown @value type, unable to process`);
    });

    // Object.assign to splat array of objects together using spread
    target.values = Object.assign(
        {
            __proto__ : null,
        },
        ...changes,
        
        // Need to splat any existing values over the top of the ones we just calculated
        // because they'll have come from before/values-local.js and thus are considered
        // higher priority than any of the fancy stuff that happened here
        // istanbul ignore next: not sure if this can really be hit but the safety doesn't hurt
        target.values || {},
    );
};

module.exports.postcssPlugin = plugin;
