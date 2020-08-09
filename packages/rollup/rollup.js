/* eslint-disable max-statements, complexity */
"use strict";

const path = require("path");

const { keyword } = require("esutils");
const utils = require("rollup-pluginutils");
const dedent = require("dedent");
const slash = require("slash");

const Processor = require("@modular-css/processor");
const output = require("@modular-css/processor/lib/output.js");

const chunker = require("./chunker.js");

// sourcemaps for css-to-js don't make much sense, so always return nothing
// https://github.com/rollup/rollup/wiki/Plugins#conventions
const emptyMappings = {
    mappings : "",
};

const DEFAULTS = {
    common       : "common.css",
    dev          : false,
    json         : false,
    meta         : false,
    namedExports : true,
    styleExport  : false,
    verbose      : false,
    empties      : false,

    // Regexp to work around https://github.com/rollup/rollup-pluginutils/issues/39
    include : /\.css$/i,
};

const deconflict = (ident, conflicts) => {
    let proposal = ident;
    let idx = 0;

    while(conflicts.has(proposal)) {
        proposal = `${ident}${++idx}`;
    }

    return proposal;
};

module.exports = (opts = {}) => {
    const options = {
        __proto__ : null,
        ...DEFAULTS,
        ...opts,
    };

    const filter = utils.createFilter(options.include, options.exclude);

    const {
        dev,
        done,
        map,
        styleExport,
        verbose,
    } = options;

    // eslint-disable-next-line no-console, no-empty-function
    const log = verbose ? console.log.bind(console, "[rollup]") : () => {};

    if(typeof map === "undefined") {
        // Sourcemaps don't make much sense in styleExport mode
        // But default to true otherwise
        options.map = !styleExport;
    }

    const processor = options.processor || new Processor(options);

    return {
        name : "@modular-css/rollup",

        buildStart() {
            log("build start");

            // done lifecycle won't ever be called on per-component styles since
            // it only happens at bundle compilation time
            // Need to do this on buildStart so it has access to this.warn() o_O
            if(styleExport && done) {
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

            const { details, exports } = processed;

            const exported = output.join(exports);
            const relative = path.relative(processor.options.cwd, id);
            const compositions = processor.dependencies(id, { filesOnly : false });
            const dependencies = processor.dependencies(id, { filesOnly : true });
            const { graph } = processor;

            const imported = new Set();
            const defined = new Map();
            
            const out = [];

            dependencies.forEach((dep) => {
                this.addWatchFile(dep);
            });

            // create import statements for all of the values used in compositions
            compositions.forEach((comp) => {
                const { file, selector } = graph.getNodeData(comp);

                if(!selector || file === id) {
                    return;
                }

                imported.add(selector);

                out.push(`import { ${selector} } from "${slash(file)}";`);
            });

            // Create vars representing exported @values & use them in local var definitions
            for(const key in exported) {
                const classes = [];

                const selectorKey = Processor.selectorKey(id, key);
                
                if(graph.hasNode(selectorKey)) {
                    const composed = graph.dependenciesOf(selectorKey);

                    composed.forEach((dep) => {
                        const { selector } = graph.getNodeData(dep);
                        
                        if(!selector) {
                            return;
                        }

                        classes.push(selector);
                    });
                }

                // Change identifier value if it overlaps with one that was imported
                const ident = deconflict(key, imported);

                defined.set(key, ident);

                classes.push(JSON.stringify(exported[key]));
                
                out.push(`const ${ident} = ${classes.join(` + " " + `)}`);
            }

            const defaultExports = Object.keys(exported)
                .map((key) => `${JSON.stringify(key)} : ${defined.get(key)}`)
                .join(`,\n`);

            if(dev) {
                out.push(dedent(`
                    const data = {
                        ${defaultExports}
                    };

                    export default new Proxy(data, {
                        get(tgt, key) {
                            if(key in tgt) {
                                return tgt[key];
                            }

                            throw new ReferenceError(
                                key + " is not exported by " + ${JSON.stringify(slash(relative))}
                            );
                        }
                    })
                `));
            } else {
                out.push(dedent(`
                    export default {
                        ${defaultExports}
                    };
                `));
            }

            if(options.namedExports) {
                const namedExports = Object.keys(exported)
                    .map((key) => {
                        const val = defined.get(key);

                        return val === key ? key : `${val} as ${key}`;
                    })
                    .join(`,\n`);

                out.push(dedent(`
                    export {
                        ${namedExports}
                    };
                `));
            }

            if(styleExport) {
                out.push(`export var styles = ${JSON.stringify(details.result.css)};`);
            }

            console.log(out.join("\n"));

            return {
                code : out.join("\n"),
                map  : emptyMappings,

                // Disable tree-shaking for CSS modules
                // moduleSideEffects : "no-treeshake",
            };
        },

        async generateBundle(outputOptions, bundle) {
            // styleExport disables all output file generation
            if(styleExport) {
                return;
            }

            const { file, dir, assetFileNames } = outputOptions;

            // console.log(bundle);

            const chunks = new Map();

            // Determine the correct to option for PostCSS by doing a bit of a dance
            const to = (!file && !dir) ?
                path.join(processor.options.cwd, assetFileNames) :
                path.join(
                    dir ? dir : path.dirname(outputOptions.file),
                    assetFileNames
                );

            // Walk bundle, create CSS output files
            Object.keys(bundle).forEach((entry) => {
                const { type, modules } = bundle[entry];

                /* istanbul ignore if */
                if(type === "asset") {
                    return;
                }

                const deps = Object.keys(modules)
                    .filter((f) => processor.has(f))
                    .map((f) => processor.normalize(f));

                if(!deps.length) {
                    return;
                }

                chunks.set(entry, deps);
            });

            console.log(chunks);

            // If assets are being hashed then the automatic annotation has to be disabled
            // because it won't include the hashed value and will lead to badness
            let mapOpt = map;

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

            for(const [ entry, css ] of chunks) {
                const ext = ".css";
                const { name } = path.parse(entry);

                /* eslint-disable-next-line no-await-in-loop */
                const result = await processor.output({
                    // Can't use this.getAssetFileName() here, because the source hasn't been set yet
                    // Have to do our best to come up with a valid final location though...
                    to  : to.replace(/\[(name|extname)\]/g, (match, field) => (field === "name" ? name : ext)),
                    map : mapOpt,

                    files : css,
                });

                // Don't output empty files if empties is falsey
                if(!options.empties && !result.css.length) {
                    duds.add(entry);

                    continue;
                }

                const id = this.emitFile({
                    type   : "asset",
                    name   : `${name}${ext}`,
                    source : result.css,
                });

                // Save off the final name of this asset for later use
                const dest = this.getFileName(id);

                names.set(entry, dest);

                log("css output", dest);

                if(result.map) {
                    // Make sure to use the rollup name as the base, otherwise it won't
                    // automatically handle duplicate names correctly
                    const fileName = dest.replace(ext, `${ext}.map`);

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

                const compositions = await processor.compositions;

                this.emitFile({
                    type   : "asset",
                    name   : dest,
                    source : JSON.stringify(compositions, null, 4),
                });
            }

            if(options.meta) {
                const meta = {};

                for(const [ entry, css ] of chunks) {
                    const chunk = bundle[entry];

                    // Attach info about this asset to the bundle
                    const { assets = [] } = chunk;

                    css.forEach((dep) => {
                        if(duds.has(dep)) {
                            return;
                        }

                        assets.push(names.get(dep));
                    });

                    chunk.assets = assets;

                    meta[entry] = {
                        assets,
                    };
                }
            
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
