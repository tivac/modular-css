"use strict";

const value = require("postcss-value-parser");
const parser = require("../../parsers/values.js");
const { valueKey } = require("../../lib/keys.js");

const plugin = "modular-css-values-local";

// Find @value fooga: wooga entries & catalog/remove them
module.exports = () => ({
    postcssPlugin : plugin,

    prepare({ opts }) {
        const { processor, from } = opts;
    
        const { values } = processor.files[from];

        return {
            AtRule : {
                value(rule) {
                    let details;
                    
                    try {
                        details = parser.parse(rule.params);
                    } catch(e) {
                        // Errors aren't world-ending, necessarily
                        return;
                    }
                
                    if(details.type !== "assignment") {
                        return;
                    }

                    const currKey = processor._addValue(from, details.name);

                    // Simple reference to an existing value
                    if(values[details.value]) {
                        const prevKey = valueKey(from, details.value);

                        processor._graph.addDependency(currKey, prevKey);

                        values[details.name] = {
                            ...values[details.value],
                            source   : rule.source,
                            from,
                            external : false,
                            graphKey : currKey,
                        };
                    } else {
                        // Otherwise need to walk @value body and check for any replacments to make
                        const parsed = value(details.value);

                        parsed.walk((node) => {
                            if(node.type !== "word" || !values[node.value]) {
                                return;
                            }

                            const prevKey = valueKey(from, node.value);

                            node.value = values[node.value].value;

                            processor._graph.addDependency(currKey, prevKey);
                        });

                        values[details.name] = {
                            value    : parsed.toString(),
                            source   : rule.source,
                            from,
                            external : false,
                            graphKey : currKey,
                        };
                    }
                    
                    rule.remove();
                },
            },
        };
    },
});

module.exports.postcss = true;
