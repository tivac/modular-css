"use strict";

const parser = require("../parsers/values.js");

const plugin = "modular-css-values-import";

// Find @value entries & catalog/remove them
module.exports = () => ({
    postcssPlugin : plugin,

    prepare(result) {
        const { from, processor } = result.opts;
        const { values } = processor.files[from];

        return {
            AtRule : {
                // eslint-disable-next-line max-statements -- too much state passing to extract
                value(rule) {
                    const parsed = parser.parse(rule.params);
                    const file = processor.resolve(from, parsed.source);
                    const source = processor.files[file];

                    rule.remove();

                    // fooga from "./wooga"
                    if(parsed.type === "composition") {
                        parsed.refs.forEach(({ name }) => {
                            /* istanbul ignore next: probably unnecssary but makes me feel better */
                            if(name in values) {
                                throw rule.error(`Cannot import ${parsed.name}, it already exists`, { word : parsed.name });
                            }

                            const value = source.values[name];

                            if(!value) {
                                throw rule.error(`Could not find @value ${name} in "${parsed.source}"`);
                            }

                            processor._addDependency({ name : from, dependency : file, refs : [{ name }] });

                            values[name] = {
                                ...value,
                                external : true,
                            };
                        });

                        return;
                    }

                    // * as fooga from "./wooga"
                    if(parsed.type === "namespace") {
                        /* istanbul ignore next: probably unnecssary but makes me feel better */
                        if(parsed.name in values) {
                            throw rule.error(`Cannot import values as ${parsed.name}, it already exists`, { word : parsed.name });
                        }
                        
                        processor._addValue(file, parsed.name, { namespace : true });
                        
                        for(const key in source.values) {
                            const name = `${parsed.name}.${key}`;
                            
                            values[name] = {
                                ...source.values[key],
                                external : true,
                            };
                        }

                        return;
                    }

                    // fooga as wooga from "./booga"
                    if(parsed.type === "alias") {
                        const [{ name }] = parsed.refs;

                        /* istanbul ignore next: probably unnecssary but makes me feel better */
                        if(name in values) {
                            throw rule.error(`Cannot alias ${name} as ${parsed.alias}, it already exists`, { word : parsed.alias });
                        }

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

                        return;
                    }

                    // * from "./wooga"
                    // istanbul ignore else: This is worthwhile in case we add a new type to the parser
                    if(parsed.type === "import") {
                        for(const name in source.values) {
                            if(name in values) {
                                result.warn(`Imported value ${name} overlaps with a local value and will be ignored`, { node : rule });

                                continue;
                            }

                            values[name] = source.values[name];
                        }

                        return;
                    }

                    // istanbul ignore next: This is worthwhile in case we add a new type to the parser
                    throw rule.error(`Unknown @value type, unable to process`);
                },
            },

            RootExit() {
                // Update any references that might've been affected by imports
                for(const name of Object.keys(values)) {
                    const { value } = values[name];

                    if(value in values) {
                        values[name] = values[value];
                    }
                }
            },
        };
    },
});

module.exports.postcss = true;
