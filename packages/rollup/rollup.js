/* eslint-disable max-statements, complexity */
"use strict";

const path = require("path");

const utils = require("rollup-pluginutils");
const dedent = require("dedent");
const identifierfy = require("identifierfy");

const Processor = require("@modular-css/processor");
const output = require("@modular-css/processor/lib/output.js");
const relative = require("@modular-css/processor/lib/relative.js");

const DEFAULT_EXT = ".css";
const DEFAULT_VALUES = "$values";

const {
    selectorKey,
    isFile,
    isSelector,
    isValue,
} = Processor;

// sourcemaps for css-to-js don't make much sense, so always return nothing
// https://github.com/rollup/rollup/wiki/Plugins#conventions
const emptyMappings = {
    mappings : "",
};

const DEFAULTS = {
    dev         : false,
    empties     : false,
    json        : false,
    map         : false,
    meta        : false,
    styleExport : false,
    verbose     : false,

    namedExports : {
        rewriteInvalid : true,
        warn           : true,
    },

    // Regexp to work around https://github.com/rollup/rollup-pluginutils/issues/39
    include : /\.css$/i,
};

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

module.exports = (
    /* istanbul ignore next: too painful to test */
    opts = {}
) => {
    const options = {
        __proto__ : null,
        ...DEFAULTS,
        ...opts,
    };

    const {
        processor = new Processor(options),
    } = options;

    const filter = utils.createFilter(options.include, options.exclude);

    // eslint-disable-next-line no-console, no-empty-function
    const log = options.verbose ? console.log.bind(console, "[rollup]") : () => { };

    // istanbul ignore if: too hard to test this w/ defaults
    if(typeof options.map === "undefined") {
        // Sourcemaps don't make much sense in styleExport mode
        // But default to true otherwise
        options.map = !options.styleExport;
    }

    const { graph } = processor;

    return {
        name : "@modular-css/rollup",

        buildStart() {
            log("build start");

            if(!options.namedExports) {
                this.warn("@modular-css/rollup doesn't allow namedExports to be disabled");
            }

            // done lifecycle won't ever be called on per-component styles since
            // it only happens at bundle compilation time
            // Need to do this on buildStart so it has access to this.warn() o_O
            if(options.styleExport && options.done) {
                this.warn(
                    `Any plugins defined during the "done" lifecycle won't run when "styleExport" is set!`
                );
            }

            // Watch any files already in the procesor
            Object.keys(processor.files).forEach((file) => this.addWatchFile(file));
        },

        watchChange(file) {
            if(!processor.has(file)) {
                return;
            }

            log("file changed", file);

            // TODO: should the file be removed if it's gone?
            processor.invalidate(file);
        },

        async transform(code, id) {
            if(!filter(id)) {
                return null;
            }

            log("transform", id);

            let processed;

            try {
                processed = await processor.string(id, code);
            } catch(e) {
                // Replace the default message with the much more verbose one
                e.message = e.toString();

                return this.error(e);
            }

            const { details } = processed;

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
                    // Watch all the CSS files this file depends on
                    this.addWatchFile(file);

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

            // Return JS representation to rollup
            return {
                code : out.join("\n"),
                map  : emptyMappings,

                // Disable tree-shaking for CSS modules w/o any classes/values to export
                // to make sure they're included in the bundle
                moduleSideEffects : namedExports.length || "no-treeshake",
            };
        },

        async generateBundle(outputOptions, bundle) {
            // styleExport disables all output file generation
            if(options.styleExport) {
                return;
            }

            const {
                file,
                dir,

                // TODO: why doesn't rollup provide this? :(
                assetFileNames = "assets/[name]-[hash][extname]",
            } = outputOptions;

            const chunks = new Map();
            const used = new Set();

            // Determine the correct to option for PostCSS by doing a bit of a dance
            const to = (!file && !dir) ?
                path.join(processor.options.cwd, assetFileNames) :
                path.join(
                    dir ? dir : path.dirname(file),
                    assetFileNames
                );

            // Walk bundle, determine CSS output files
            // TODO: remove any files that only export @values but no classes?
            Object.keys(bundle).forEach((entry) => {
                const { type, modules, name } = bundle[entry];

                /* istanbul ignore if */
                if(type === "asset") {
                    return;
                }

                const deps = Object.keys(modules).reduce((acc, f) => {
                    if(processor.has(f)) {
                        const css = processor.normalize(f);

                        used.add(css);
                        acc.push(css);
                    }

                    return acc;
                }, []);

                if(!deps.length) {
                    return;
                }

                chunks.set(entry, { deps, name });
            });

            // Add any bare CSS files to be output
            processor.fileDependencies().forEach((css) => {
                if(used.has(css)) {
                    return;
                }

                const { name } = path.parse(css);

                chunks.set(name, { deps : [ css ], name });
            });

            // If assets are being hashed then the automatic annotation has to be disabled
            // because it won't include the hashed value and will lead to badness
            let mapOpt = options.map;

            if(assetFileNames.includes("[hash]") && typeof mapOpt === "object") {
                mapOpt = {
                    __proto__  : null,
                    ...mapOpt,
                    annotation : false,
                };
            }

            // Track specified name -> output name for writing out metadata later
            const names = new Map();

            // Track chunks that don't actually need to be output
            const duds = new Set();

            for(const [ entry, { deps, name }] of chunks) {
                /* eslint-disable-next-line no-await-in-loop */
                const result = await processor.output({
                    // Can't use this.getAssetFileName() here, because the source hasn't been set yet
                    //  Have to do our best to come up with a valid final location though...
                    to : to.replace(/\[(name|extname)\]/g, (match, field) =>
                        (field === "name" ? name : DEFAULT_EXT)
                    ),
                    map : mapOpt,

                    files : deps,
                });

                // Don't output empty files if empties is falsey
                if(!options.empties && !result.css.length) {
                    duds.add(entry);

                    continue;
                }

                const id = this.emitFile({
                    type   : "asset",
                    name   : `${name}${DEFAULT_EXT}`,
                    source : result.css,
                });

                // Save off the final name of this asset for later use
                const dest = this.getFileName(id);

                names.set(entry, dest);

                log("css output", dest);

                if(result.map) {
                    // Make sure to use the rollup name as the base, otherwise it won't
                    // automatically handle duplicate names correctly
                    const fileName = dest.replace(DEFAULT_EXT, `${DEFAULT_EXT}.map`);

                    log("map output", fileName);

                    this.emitFile({
                        type   : "asset",
                        source : result.map.toString(),

                        // Use fileName instead of name because this has to follow the parent
                        // file naming and can't be double-hashed
                        fileName,
                    });

                    // Had to re-add the map annotation to the end of the source files
                    // if the filename had a hash, since we stripped it out up above
                    if(assetFileNames.includes("hash")) {
                        bundle[dest].source += `\n/*# sourceMappingURL=${path.basename(fileName)} */`;
                    }
                }
            }

            if(options.json) {
                const files = Object.keys(processor.files);

                // Ensure file order is consistent
                files.sort();

                // Wait to ensure that all files have completed processing
                await Promise.all(
                    files.map((id) => processor.files[id].result)
                );

                const json = Object.create(null);

                files.forEach((id) => {
                    json[relative(processor.options.cwd, id)] = {
                        // @values
                        ...output.values(processor.files[id].values),

                        // classes
                        ...output.fileCompositions(processor.files[id], processor, { joined : true }),
                    };
                });

                const source = JSON.stringify(json, null, 4);

                if(typeof options.json === "string") {
                    log("json output", options.json);

                    this.emitFile({
                        type     : "asset",
                        fileName : options.json,
                        source,
                    });
                } else {
                    log("json output", "exports.json");

                    this.emitFile({
                        type : "asset",
                        name : "exports.json",
                        source,
                    });
                }
            }

            // Always attach meta info to bundle chunks
            const meta = {};

            for(const [ entry ] of chunks) {
                const chunk = bundle[entry];

                if(!chunk) {
                    continue;
                }

                // Attach info about this asset to the bundle
                const { assets = [] } = chunk;

                assets.push(names.get(entry));

                chunk.assets = assets;

                meta[entry] = {
                    assets,
                };
            }

            if(options.meta) {
                const dest = typeof options.meta === "string" ? options.meta : "metadata.json";

                log("metadata output", dest);

                this.emitFile({
                    type   : "asset",
                    source : JSON.stringify(meta, null, 4),
                    name   : dest,
                });
            }
        },
    };
};
