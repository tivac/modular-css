"use strict";

const value = require("postcss-value-parser");
const parser = require("../../parsers/values.js");

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

                    // Simple reference to an existing value
                    if(values[details.value]) {
                        values[details.name] = {
                            ...values[details.value],
                            source   : rule.source,
                            external : false,
                        };

                        // console.log("values-local after", values[details.name]);
                    } else {
                        // Otherwise need to walk @value body and check for any replacments to make
                        const parsed = value(details.value);

                        parsed.walk((node) => {
                            if(node.type !== "word" || !values[node.value]) {
                                return;
                            }

                            node.value = values[node.value].value;
                        });

                        values[details.name] = {
                            value    : parsed.toString(),
                            source   : rule.source,
                            external : false,
                        };
                    }
                    
                    rule.remove();
                },
            },
        };
    },
});

module.exports.postcss = true;
