"use strict";

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
                    let parsed;
                    
                    try {
                        parsed = parser.parse(rule.params);
                    } catch(e) {
                        // Errors aren't world-ending, necessarily
                        return;
                    }
                
                    if(parsed.type !== "assignment") {
                        return;
                    }

                    // References to existing values are handled as object references,
                    // so they're always kept up-to-date
                    if(values[parsed.value]) {
                        values[parsed.name] = values[parsed.value];
                    } else {
                        values[parsed.name] = {
                            value  : parsed.value,
                            source : rule.source,
                        };
                    }
                    
                    rule.remove();
                },
            },
        };
    },
});

module.exports.postcss = true;
