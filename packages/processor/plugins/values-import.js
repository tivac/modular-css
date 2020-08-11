"use strict";

const parser = require("../parsers/values.js");

const plugin = "modular-css-values-import";

const handlers = Object.create(null);

// fooga from "./wooga"
handlers.composition = ({ parsed, source, rule, values }) => {
    parsed.refs.forEach(({ name }) => {
        if(!source.values[name]) {
            throw rule.error(`Could not find @value ${name} in "${parsed.source}"`);
        }

        values[name] = source.values[name];
    });

    return values;
};

// * as fooga from "./wooga"
handlers.namespace = ({ parsed, source, values }) => {
    for(const key in source.values) {
        values[`${parsed.name}.${key}`] = source.values[key];
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
        let source;

        if(parsed.source) {
            source = processor.files[processor.resolve(from, parsed.source)];
        }

        values = handlers[parsed.type]({
            parsed,
            source,
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
