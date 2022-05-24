/* eslint-disable max-statements, complexity */
"use strict";

const path = require("path");

const dedent = require("dedent");
const identifierfy = require("identifierfy");

const Processor = require("@modular-css/processor");
const relative = require("@modular-css/processor/lib/relative.js");

const slash = (file) => file.replace(/\/|\\/g, "/");

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

const deconflicted = new Map();

const deconflict = (file, name) => {
    const safe = identifierfy(name);
    let idx = 0;
    let proposal = safe;

    if(!deconflicted.has(file)) {
        deconflicted.set(file, new Map());
    }

    const map = deconflicted.get(file);

    while(map.has(proposal)) {
        proposal = `${safe}${++idx}`;
    }

    map.set(proposal, name);

    return proposal;
};

const prop = ([ key, value ]) => (key === value ? key : `${JSON.stringify(key)} : ${value}`);
const esm = (key, value) => (key === value ? key : `${key} as ${value}`);

exports.reset = () => {
    deconflicted.clear();
};

exports.transform = (file, processor, opts = {}) => {
    const options = {
            __proto__ : null,
            ...DEFAULTS,
            ...opts,
        };

    const id = processor.normalize(file);
    const warnings = [];
    const details = processor.files[file];
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
    // const identifiers = new Map();

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
    dependencies.forEach((depKey) => {
        const data = graph.getNodeData(depKey);
        const { file: depFile } = data;

        if(!importsMap.has(depFile)) {
            importsMap.set(depFile, new Map());
        }

        const imported = importsMap.get(depFile);

        // File we're transforming
        if(depFile === id) {
            // Track this selector as part of the keys to be exported, adding
            // here so it'll be sorted topologically
            if(isSelector(depKey)) {
                exportedKeys.add(data.selector);
            }

            return;
        }

        if(isFile(depKey)) {
            // Add each selector this file depends on to the imports list
            data.selectors.forEach((key) => {
                const nodeData = graph.getNodeData(key);
                
                const { selector } = nodeData;
                let { unique : depUnique } = nodeData;

                // Save a reference to the unique key for this file/selector combo
                if(!depUnique) {
                    depUnique = nodeData.unique = deconflict(depFile, selector);
                }

                const localUnique = deconflict(id, selector);

                externalsMap.set(selectorKey(depFile, selector), localUnique);

                // Store external references as unique, safe values always
                imported.set(depUnique, localUnique);
            });

            return;
        }

        // @value references need to be specially imported & handled
        if(isValue(depKey)) {
            const { value, namespace, alias } = data;
            const { name : filename } = path.parse(depFile);
            const importName = `$${filename}Values`;

            let unique;

            if(!externalsMap.has(importName)) {
                unique = deconflict(depFile, importName);

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

        const names = [ ...imports ].map(([ key, value ]) => esm(key, value));

        out.push(`import { ${names.join(", ")} } from "${slash(from)}";`);
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

        const unique = deconflict(id, key);

        internalsMap.set(value, unique);

        out.push(`const ${unique} = ${JSON.stringify(value)}`);

        valueExports.set(key, unique);
    });

    if(valueExports.size) {
        const unique = deconflict(id, DEFAULT_VALUES);

        out.push(dedent(`const ${unique} = {
            ${[ ...valueExports ].map(prop).join(",\n")},
        };`));


        defaultExports.push([ DEFAULT_VALUES, unique ]);

        namedExports.push(esm(unique, DEFAULT_VALUES));
    }

    // Create vars representing exported classes & use them in local var definitions
    exportedKeys.forEach((key) => {
        const elements = [];
        const sKey = processor._addSelector(id, key);
        let unique;

        // Build the list of composed classes for this class
        const graphData = graph.getNodeData(sKey);
        
        // Grab the previously-determined unique value for this selector
        unique = graphData.unique;

        if(!unique) {
            unique = graphData.unique = deconflict(id, key);
        }

        internalsMap.set(key, unique);
        
        graph.dependenciesOf(sKey).forEach((dep) => {
            const { file: src, selector } = graph.getNodeData(dep);

            // Get the value from the right place
            if(src !== id) {
                elements.push(externalsMap.get(dep));
            } else {
                elements.push(internalsMap.get(selector));
            }
        });

        elements.push(...details.classes[key].map((t) => JSON.stringify(t)));

        out.push(`const ${unique} = ${elements.join(` + " " + `)}`);

        defaultExports.push([ key, unique ]);

        const namedExport = identifierfy(key);

        if(namedExport === key) {
            namedExports.push(esm(unique, key));
        } else if(options.namedExports.rewriteInvalid) {
            // eslint-disable-next-line no-console
            warnings.push(`"${key}" is not a valid JS identifier, exported as "${namedExport}"`);

            namedExports.push(esm(unique, namedExport));
        } else {
            // eslint-disable-next-line no-console
            warnings.push(`"${key}" is not a valid JS identifier`);
        }
    });

    if(options.dev) {
        out.push(dedent(`
            const data = {
                ${defaultExports.map(prop).join(",\n")}
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
                ${defaultExports.map(prop).join(",\n")}
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

    const code = out.join("\n");

    // console.log(id, "\n\n", code);

    // Return JS representation
    return {
        code,
        dependencies,
        namedExports,
        warnings,
    };
};
