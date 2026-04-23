"use strict";

const value = require("postcss-value-parser");
const parser = require("../../parsers/values.js");

const plugin = "modular-css-values-local";

const _cache = new Map();

// Find @value fooga: wooga entries & catalog/remove them
module.exports = () => ({
    postcssPlugin: plugin,

    prepare({ opts }) {
        const { processor, from } = opts;

        const { values } = processor.files[from];

        return {
            AtRule: {
                value(rule) {
                    let parsed;

                    try {
                        parsed = _cache.get(rule.params) ?? parser.parse(rule.params);

                        _cache.set(rule.params, parsed);
                    } catch(_e) {
                        // Errors aren't world-ending, necessarily
                        return;
                    }

                    if(parsed.type !== "assignment") {
                        return;
                    }

                    // Simple reference to an existing value
                    if(values[parsed.value]) {
                        values[parsed.name] = {
                            ...values[parsed.value],
                            source: rule.source,
                            external: false,
                        };

                        // console.log("values-local after", values[details.name]);
                    } else {
                        // Otherwise need to walk @value body and check for any replacments to make
                        const contents = value(parsed.value);

                        contents.walk((node) => {
                            if(node.type !== "word" || !values[node.value]) {
                                return;
                            }

                            node.value = values[node.value].value;
                        });

                        values[parsed.name] = {
                            value: contents.toString(),
                            source: rule.source,
                            external: false,
                        };
                    }

                    rule.remove();
                },
            },
        };
    },
});

module.exports.postcss = true;
