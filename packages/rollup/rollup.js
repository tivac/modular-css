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

module.exports = (opts) => {
    const options = Object.assign(Object.create(null), {
        common       : "common.css",
        dev          : false,
        json         : false,
        meta         : false,
        namedExports : true,
        styleExport  : false,
        verbose      : false,
        empties      : true,

        // Regexp to work around https://github.com/rollup/rollup-pluginutils/issues/39
        include : /\.css$/i,
    }, opts);

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
            const dependencies = processor.dependencies(id);

            const out = [
                dev ?
                    dedent(`
                        const data = ${JSON.stringify(exported)};

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
                    `) :
                    `export default ${JSON.stringify(exported, null, 4)};`,
            ];

            if(options.namedExports) {
                Object.entries(exported).forEach(([ ident, value ]) => {
                    if(keyword.isReservedWordES6(ident) || !keyword.isIdentifierNameES6(ident)) {
                        this.warn(`Invalid JS identifier "${ident}", unable to export`);

                        return;
                    }

                    out.push(`export var ${ident} = ${JSON.stringify(value)};`);
                });
            }

            if(styleExport) {
                out.push(`export var styles = ${JSON.stringify(details.result.css)};`);
            }

            dependencies.forEach((dep) => this.addWatchFile(dep));

            return {
                code : out.join("\n"),
                map  : emptyMappings,
            };
        },

        async generateBundle(outputOptions, bundle) {
            // styleExport disables all output file generation
            if(styleExport) {
                return;
            }

            // Really wish rollup would provide these defaults somehow
            const {
                assetFileNames = "assets/[name]-[hash][extname]",
            } = outputOptions;

            // Determine the correct to option for PostCSS by doing a bit of a dance
            const to = (!outputOptions.file && !outputOptions.dir) ?
                path.join(processor.options.cwd, assetFileNames) :
                path.join(
                    outputOptions.dir ? outputOptions.dir : path.dirname(outputOptions.file),
                    assetFileNames
                );

            // Store an easy-to-use Set that maps all the entry files
            const entries = new Set();

            // Clone the processor graph so we can chunk it w/o making things crazy
            const graph = processor.graph.clone();

            // Convert the graph over to a chunking-amenable format
            graph.overallOrder().forEach((node) => graph.setNodeData(node, [ node ]));

            // Walk all bundle entries and add them to the dependency graph
            Object.entries(bundle).forEach(([ entry, chunk ]) => {
                const { isAsset, modules } = chunk;

                /* istanbul ignore if */
                if(isAsset) {
                    return;
                }
                
                // Get CSS files being used by this chunk
                const css = Object.keys(modules).filter((file) => processor.has(file));

                if(!css.length) {
                    return;
                }

                entries.add(entry);

                // TODO: this needs to check if the graph already has a value for entry and
                // append the entry to the end of it if necessary. Support for inline <style> in
                // @modular-css/svelte is broken atm because this just splats over the top of it
                graph.addNode(entry, [ entry ]);

                css.forEach((file) => graph.addDependency(entry, processor.normalize(file)));
            });

            // Output CSS chunks
            const chunked = chunker({
                graph,
                entries : [ ...entries ],
            });

            // If assets are being hashed then the automatic annotation has to be disabled
            // because it won't include the hashed value and will lead to badness
            let mapOpt = map;

            if(assetFileNames.includes("[hash]") && typeof mapOpt === "object") {
                mapOpt = Object.assign(
                    Object.create(null),
                    mapOpt,
                    { annotation : false }
                );
            }

            // Track specified name -> output name for writing out metadata later
            const names = new Map();

            // Track chunks that don't actually need to be output
            const duds = new Set();

            for(const node of chunked.overallOrder()) {
                // Only want to deal with CSS currently
                if(entries.has(node)) {
                    continue;
                }

                if(processor.options.warnOnUnused) {
                    processor.unused.forEach((selectors, file) =>
                        // eslint-disable-next-line no-console
                        console.warn(
                            `[@modular-css/rollup] Unused classes found in ${path.relative(processor.options.cwd, file)}:`,
                            `.${[ ...selectors ].join(", .")}`,
                        )
                    );
                }

                const ext = ".css";
                const name = path.basename(node, path.extname(node));

                /* eslint-disable-next-line no-await-in-loop */
                const result = await processor.output({
                    // Can't use this.getAssetFileName() here, because the source hasn't been set yet
                    // Have to do our best to come up with a valid final location though...
                    to  : to.replace(/\[(name|extname)\]/g, (match, field) => (field === "name" ? name : ext)),
                    map : mapOpt,

                    files : graph.getNodeData(node),
                });

                // Don't output empty files if empties is falsey
                if(!options.empties && !result.css.length) {
                    duds.add(node);

                    continue;
                }

                const id = this.emitFile({
                    type   : "asset",
                    name   : `${name}${ext}`,
                    source : result.css,
                });

                // Save off the final name of this asset for later use
                const dest = this.getAssetFileName(id);

                names.set(node, dest);

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

            const meta = {};

            Object.entries(bundle).forEach(([ entry, chunk ]) => {
                const { isAsset } = chunk;

                if(isAsset || !entries.has(entry)) {
                    return;
                }

                // Attach info about this asset to the bundle
                const { assets = [] } = chunk;

                chunked.dependenciesOf(entry)
                    .filter((dep) => !duds.has(dep))
                    .forEach((dep) => assets.push(names.get(dep)));

                chunk.assets = assets;

                meta[entry] = {
                    assets,
                };
            });

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
