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

// sourcemaps for css-to-js don't make much sense, so always return nothing
// https://github.com/rollup/rollup/wiki/Plugins#conventions
const emptyMappings = {
    mappings : "",
};

const DEFAULTS = {
    common      : "common.css",
    dev         : false,
    json        : false,
    meta        : false,
    styleExport : false,
    valueExport : true,
    verbose     : false,
    empties     : false,
    
    namedExports : {
        rewriteInvalid : true,
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

module.exports = (opts = {}) => {
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
    const log = options.verbose ? console.log.bind(console, "[rollup]") : () => {};

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
            const { classes } = details;

            const exportedKeys = Object.keys(classes);
            const fileId = relative(processor.options.cwd, id);
            const compositions = processor.dependencies(id, { filesOnly : false });
            const dependencies = processor.dependencies(id, { filesOnly : true });
            
            const identifiers = new Map();
            const importsMap = new Map();

            const out = [];
            const defaultExports = [];
            const namedExports = [];

            // create import statements for all of the values used in compositions
            compositions.forEach((comp) => {
                const { file, selector } = graph.getNodeData(comp);

                if(!selector || file === id) {
                    return;
                }

                const unique = deconflict(identifiers, selector);

                out.push(`import { ${selector} as ${unique} } from ${JSON.stringify(file)};`);

                importsMap.set(`${file}${selector}`, unique);
            });

            const values = Object.keys(details.values);

            // Add default exports for all the @values
            if(options.valueExport && values.length) {
                values.forEach((key) => {
                    const { value } = details.values[key];

                    const unique = deconflict(identifiers, key);

                    out.push(`const ${unique} = ${JSON.stringify(value)}`);

                    defaultExports.push(`${JSON.stringify(key)} : ${unique}`);
                    
                    if(options.namedExports) {
                        const namedExport = identifierfy(key);
                        
                        if(namedExport === key) {
                            namedExports.push(`${unique} as ${key}`);
                        } else if(options.namedExports.rewriteInvalid) {
                            this.warn(`Invalid JS identifier "${key}" rewritten to "${namedExport}"`);
                            
                            namedExports.push(`${unique} as ${namedExport}`);
                        } else {
                            this.warn(`Invalid JS identifier "${key}", unable use as named export`);
                        }
                    }
                });
            }

            // Create vars representing exported classes & use them in local var definitions
            exportedKeys.forEach((key) => {
                const elements = [];

                const selectorKey = Processor.selectorKey(id, key);
                
                if(graph.hasNode(selectorKey)) {
                    graph.dependenciesOf(selectorKey).forEach((dep) => {
                        const { file, selector } = graph.getNodeData(dep);
                        
                        if(!selector) {
                            return;
                        }

                        elements.push(importsMap.get(`${file}${selector}`));
                    });
                }

                const unique = deconflict(identifiers, key);

                elements.push(...classes[key].map((t) => JSON.stringify(t)));

                out.push(`const ${unique} = ${elements.join(` + " " + `)}`);

                defaultExports.push(`${JSON.stringify(key)} : ${unique}`);

                if(options.namedExports) {
                    const namedExport = identifierfy(key);
                    
                    if(namedExport === key) {
                        namedExports.push(`${unique} as ${key}`);
                    } else if(options.namedExports.rewriteInvalid) {
                        this.warn(`Invalid JS identifier "${key}" rewritten to "${namedExport}"`);
                        
                        namedExports.push(`${unique} as ${namedExport}`);
                    } else {
                        this.warn(`Invalid JS identifier "${key}", unable use as named export`);
                    }
                }
            });

            if(options.dev) {
                out.push(dedent(`
                    const data = {
                        ${defaultExports.join(",\n")}
                    };

                    export default new Proxy(data, {
                        get(tgt, key) {
                            if(key in tgt) {
                                return tgt[key];
                            }

                            throw new ReferenceError(
                                key + " is not exported by " + ${JSON.stringify(fileId)}
                            );
                        }
                    })
                `));
            } else {
                out.push(dedent(`
                    export default {
                        ${defaultExports.join(",\n")}
                    };
                `));
            }

            if(options.namedExports) {
                out.push(dedent(`
                    export {
                        ${namedExports.join(",\n")}
                    };
                `));
            }

            if(options.styleExport) {
                out.push(`export var styles = ${JSON.stringify(details.result.css)};`);
            }

            // Watch all the CSS files this file depends on
            dependencies.forEach((dep) => {
                this.addWatchFile(dep);
            });

            // console.log(id, "\n", out.join("\n"));

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
                assetFileNames,
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
            
            // Walk bundle, create CSS output files
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

            // Add any bare CSS files to be output as part of the common chunk
            processor.dependencies().forEach((css) => {
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
                    to : to.replace(/\[(name|extname)\]/g,  (match, field) =>
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
                const dest = typeof options.json === "string" ? options.json : "exports.json";

                log("json output", dest);

                const files = Object.keys(processor.files);

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

                this.emitFile({
                    type   : "asset",
                    name   : dest,
                    source : JSON.stringify(json, null, 4),
                });
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
