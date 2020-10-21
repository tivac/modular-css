"use strict";

const parser = require("../parsers/values.js");

const plugin = "modular-css-values-import";

const handlers = Object.create(null);

// fooga from "./wooga"
handlers.composition = ({ parsed, rule, values, opts }) => {
    const { from, processor } = opts;

    const file = processor.resolve(from, parsed.source);
    const source = processor.files[file];
    
    parsed.refs.forEach(({ name }) => {
        if(!source.values[name]) {
            throw rule.error(`Could not find @value ${name} in "${parsed.source}"`);
        }

        processor._addValue(file, name);

        values[name] = {
            ...source.values[name],
            external : true,
        };
    });

    return values;
};

// * as fooga from "./wooga"
handlers.namespace = ({ opts, parsed, values }) => {
    const { from, processor } = opts;

    const file = processor.resolve(from, parsed.source);
    const source = processor.files[file];

    processor._addValue(file, parsed.name, { namespace : true });
    
    for(const key in source.values) {
        const name = `${parsed.name}.${key}`;

        values[name] = {
            ...source.values[key],
            external : true,
        };
    }

    return values;
};

// fooga as wooga from "./booga"
handlers.alias = ({ parsed, source, values }) => {
    values[parsed.alias] = source.values[parsed.name];

    return values;
};

// * from "./wooga"
handlers.import = ({ source }) => ({
    __proto__ : null,
    ...source.values,
});

// Find @value entries & catalog/remove them
module.exports = (css, { opts }) => {
    const { from, processor } = opts;
    const file = processor.files[from];

    let values = { __proto__ : null };
    
    css.walkAtRules("value", (rule) => {
        const parsed = parser.parse(rule.params);

        values = handlers[parsed.type]({
            opts,
            parsed,
            rule,
            values,
        });

        rule.remove();
    });

    file.values = {
        __proto__ : null,
        
        ...values,

        // Need to splat any existing values over the top of the ones we just calculated
        // because they'll have come from before/values-local.js and thus are considered
        // higher priority than any of the fancy stuff that happened here
        ...(file.values || {}),
    };
};

module.exports.postcssPlugin = plugin;
