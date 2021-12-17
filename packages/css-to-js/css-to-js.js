/* eslint-disable max-statements, complexity */
"use strict";

const path = require("path");

const dedent = require("dedent");
const identifierfy = require("identifierfy");

const Processor = require("@modular-css/processor");
const relative = require("@modular-css/processor/lib/relative.js");

const DEFAULT_VALUES = "$values";

const DEFAULTS = {
    dev         : false,
    styleExport : false,

    namedExports : {
        rewriteInvalid : true,
        warn           : true,
    },
};

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

exports.transform = (id, processor, opts = {}) => {
    const options = {
            __proto__ : null,
            ...DEFAULTS,
            ...opts,
        };

    const warnings = [];
    const details = processor.files[id];
    const { graph } = processor;

    const relativeId = relative(processor.options.cwd, id);
    const dependencies = new Set();

    // Only want direct dependencies and any first-level dependencies
    // of this file to be processed
    graph.outgoingEdges[Processor.fileKey(id)].forEach((dep) => {
        dependencies.add(dep);

        graph.outgoingEdges[dep].forEach((d) => {
            dependencies.add(d);
        });
    });

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

    // create import statements for all of the values used in compositions
    dependencies.forEach((dep) => {
        const data = graph.getNodeData(dep);
        const { file } = data;

        if(!importsMap.has(file)) {
            importsMap.set(file, new Map());
        }

        const imported = importsMap.get(file);

        // File we're transforming
        if(file === id) {
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

        out.push(`import { ${names.join(", ")} } from ${JSON.stringify(from)};`);
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
        const sKey = selectorKey(id, key);

        internalsMap.set(key, unique);

        // Build the list of composed classes for this class
        if(graph.hasNode(sKey)) {
            graph.dependenciesOf(sKey).forEach((dep) => {
                const { file, selector } = graph.getNodeData(dep);

                // Get the value from the right place
                if(file !== id) {
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
            // eslint-disable-next-line no-console
            warnings.push(`"${key}" is not a valid JS identifier, exported as "${namedExport}"`);

            namedExports.push(`${unique} as ${namedExport}`);
        } else {
            // eslint-disable-next-line no-console
            warnings.push(`"${key}" is not a valid JS identifier`);
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
                        key + " is not exported by " + ${JSON.stringify(relativeId)}
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

    if(options.styleExport) {
        out.push(`export var styles = ${JSON.stringify(details.result.css)};`);
    }

    // Return JS representation
    return {
        code : out.join("\n"),
        dependencies,
        namedExports,
        warnings,
    };
};
