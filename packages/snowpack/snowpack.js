"use strict";

const path = require("path");

const identifierfy = require("identifierfy");
const dedent = require("dedent");

const Processor = require("@modular-css/processor");
const relative = require("@modular-css/processor/lib/relative.js");

const DEFAULT_VALUES = "$values";

const {
    selectorKey,
    isFile,
    isSelector,
    isValue,
} = Processor;

const deconflict = (map, ident) => {
    let proposal = identifierfy(ident);
    let idx = 0;

    while(map.has(proposal)) {
        proposal = `${ident}${++idx}`;
    }

    map.set(proposal, ident);

    return proposal;
};

const property = ([ key, value ]) => {
    if(key === value) {
        return key;
    }

    return `${JSON.stringify(key)} : ${value}`;
};

module.exports = (snowpackConfig, options) => {
    const {
        processor = new Processor({ ...options }),
    } = options;

    const { graph } = processor;

    return {
        name : "@modular-css/snowpack",

        resolve : {
            input  : [ ".css" ],
            output : [ ".js", ".css" ],
        },

        async onChange({ filePath }) {
            console.log("onChange", filePath);

            if(!processor.has(filePath)) {
                return;
            }

            // TODO: should the file be removed if it's gone?
            processor.invalidate(filePath);

            const deps = processor.fileDependents(filePath);

            console.log(deps);

            deps.forEach((dep) => this.markChanged(dep));
        },

        // eslint-disable-next-line max-statements
        async load({ filePath }) {
            console.log("LOAD", filePath);

            let processed;

            try {
                processed = await processor.file(filePath);
            } catch(e) {
                // Replace the default message with the much more verbose one
                e.message = e.toString();

                return this.error(e);
            }

            const { details } = processed;

            const relativePath = relative(processor.options.cwd, filePath);
            
            // Direct deps and 1 level further are all we want to process
            const dependencies = new Set();

            // All used identifiers
            const identifiers = new Map();

            // External identifiers mapped to their unique names
            const externalsMap = new Map();

            // Internal identifiers mapped to their unique names
            const internalsMap = new Map();

            // Map of files & their imports
            const importsMap = new Map();

            const out = [];
            const defaultExports = [];
            const namedExports = [];
            const valueExports = new Map();

            // All the class keys exported by this module
            const exportedKeys = new Set();

            // Only want direct dependencies and any first-level dependencies
            // of this file to be processed
            graph.outgoingEdges[Processor.fileKey(filePath)].forEach((dep) => {
                dependencies.add(dep);

                graph.outgoingEdges[dep].forEach((d) => {
                    dependencies.add(d);
                });
            });

            // create import statements for all of the values used in compositions
            // eslint-disable-next-line max-statements
            dependencies.forEach((dep) => {
                const data = graph.getNodeData(dep);
                const { file } = data;

                if(!importsMap.has(file)) {
                    importsMap.set(file, new Map());
                }

                const imported = importsMap.get(file);

                // File we're transforming
                if(file === filePath) {
                    // Track this selector as part of the keys to be exported, adding
                    // here so it'll be sorted topologically
                    if(isSelector(dep)) {
                        exportedKeys.add(data.selector);
                    }

                    return;
                }

                if(isFile(dep)) {
                    // Add each selector this file depends on to the imports list
                    data.selectors.forEach((key) => {
                        const { selector: name } = graph.getNodeData(key);

                        const unique = deconflict(identifiers, name);

                        externalsMap.set(selectorKey(file, name), unique);

                        imported.set(name, unique);
                    });

                    return;
                }

                // @value references need to be specially imported & handled
                if(isValue(dep)) {
                    const { value, namespace, alias } = data;
                    const { name : filename } = path.parse(file);
                    const importName = `$${filename}Values`;

                    let unique;

                    if(!externalsMap.has(importName)) {
                        unique = deconflict(identifiers, importName);

                        // Add a values import to the imports list
                        externalsMap.set(importName, unique);
                    } else {
                        unique = externalsMap.get(importName);
                    }

                    imported.set(DEFAULT_VALUES, unique);

                    // Add @values namespace to the exported values block
                    if(namespace) {
                        // Don't want to import namespaces multiple times
                        // if(!imported.has(DEFAULT_VALUES)) {
                            valueExports.set(value, unique);
                        // }
                    } else {
                        valueExports.set(value, `${unique}[${JSON.stringify(alias || value)}]`);
                    }

                    return;
                }
            });

            // Write out all the imports
            importsMap.forEach((imports, from) => {
                if(!imports.size) {
                    return;
                }

                const names = [ ...imports ].map(([ key, value ]) => `${key} as ${value}`);

                const relativeFrom = relative(processor.options.cwd, from);

                out.push(`import { ${names.join(", ")} } from ${JSON.stringify(relativeFrom)};`);
            });

            // Add the rest of the exported keys in whatever order because it doesn't matter
            Object.keys(details.classes).forEach((key) => exportedKeys.add(key));

            // Add default exports for all the @values
            Object.keys(details.values).forEach((key) => {
                const { value, external } = details.values[key];

                // Externally-imported @values were already added, so skip them
                if(external) {
                    return;
                }

                const unique = deconflict(identifiers, key);

                internalsMap.set(value, unique);

                out.push(`const ${unique} = ${JSON.stringify(value)}`);

                valueExports.set(key, unique);
            });

            if(valueExports.size) {
                const unique = deconflict(identifiers, DEFAULT_VALUES);

                out.push(dedent(`const ${unique} = {
                    ${[ ...valueExports ].map(property).join(",\n")},
                };`));


                defaultExports.push([ DEFAULT_VALUES, unique ]);

                namedExports.push(`${unique} as ${DEFAULT_VALUES}`);
            }

            // Create vars representing exported classes & use them in local var definitions
            exportedKeys.forEach((key) => {
                const elements = [];
                const unique = deconflict(identifiers, key);
                const sKey = selectorKey(filePath, key);

                internalsMap.set(key, unique);

                // Build the list of composed classes for this class
                if(graph.hasNode(sKey)) {
                    graph.dependenciesOf(sKey).forEach((dep) => {
                        const { file, selector } = graph.getNodeData(dep);

                        // Get the value from the right place
                        if(file !== filePath) {
                            elements.push(externalsMap.get(dep));
                        } else {
                            elements.push(internalsMap.get(selector));
                        }
                    });
                }

                elements.push(...details.classes[key].map((t) => JSON.stringify(t)));

                out.push(`const ${unique} = ${elements.join(` + " " + `)}`);

                defaultExports.push([ key, unique ]);

                const namedExport = identifierfy(key);

                if(namedExport === key) {
                    namedExports.push(`${unique} as ${key}`);
                } else if(options.namedExports.rewriteInvalid) {
                    this.warn(`"${key}" is not a valid JS identifier, exported as "${namedExport}"`);

                    namedExports.push(`${unique} as ${namedExport}`);
                } else {
                    this.warn(`"${key}" is not a valid JS identifier`);
                }
            });

            if(options.dev) {
                out.push(dedent(`
                    const data = {
                        ${defaultExports.map(property).join(",\n")}
                    };

                    export default new Proxy(data, {
                        get(tgt, key) {
                            if(key in tgt) {
                                return tgt[key];
                            }

                            throw new ReferenceError(
                                key + " is not exported by " + ${JSON.stringify(relativePath)}
                            );
                        }
                    })
                `));
            } else {
                out.push(dedent(`
                    export default {
                        ${defaultExports.map(property).join(",\n")}
                    };
                `));
            }

            out.push("");

            out.push(dedent(`
                export {
                    ${namedExports.join(",\n")}
                };
            `));

            console.log(out.join("\n"));

            return {
                ".js"  : out.join("\n"),
                ".css" : details.result.css,
            };
        },

        async transform({ fileExt, id }) {
            if(fileExt !== ".css") {
                return;
            }
            
            console.log("TRANSFORM", id);
            
            // TODO: need to know what svelte files depend on this CSS file and call
            // this.markChanged() on them, will need to add that to @modular-css/svelte
            // and store it in the processor instance somewhere
            const deps = processor.fileDependencies(id);

            const result = await processor.output({
                // Can't use this.getAssetFileName() here, because the source hasn't been set yet
                //  Have to do our best to come up with a valid final location though...
                to    : id,
                files : [ ...deps, id ],
            });

            console.log(result.css);

            return result.css;
        },
    };
};
