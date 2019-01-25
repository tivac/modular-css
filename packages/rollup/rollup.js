/* eslint-disable max-statements, complexity */
"use strict";

const path = require("path");

const { keyword } = require("esutils");
const utils = require("rollup-pluginutils");
const dedent = require("dedent");
const slash = require("slash");
const Graph = require("dependency-graph").DepGraph;

const Processor = require("@modular-css/processor");
const output = require("@modular-css/processor/lib/output.js");

const { parse } = require("./parser.js");

// sourcemaps for css-to-js don't make much sense, so always return nothing
// https://github.com/rollup/rollup/wiki/Plugins#conventions
const emptyMappings = {
    mappings : "",
};

module.exports = (opts) => {
    const options = Object.assign(Object.create(null), {
        common       : "common.css",
        dev          : false,
        include      : "**/*.css",
        json         : false,
        meta         : false,
        namedExports : true,
        styleExport  : false,
        verbose      : false,
    }, opts);

    const filter = utils.createFilter(options.include, options.exclude);

    const {
        common,
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

            const { details, exports } = await processor.string(id, code);

            const exported = output.join(exports);
            const relative = path.relative(processor.options.cwd, id);

            const out = [
                ...processor.dependencies(id).map((dep) => `import ${JSON.stringify(dep)};`),
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

            processor.dependencies(id).forEach((dependency) => this.addWatchFile(dependency));

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
                chunkFileNames = "[name]-[hash].js",
                entryFileNames = "[name].js",
                assetFileNames = "assets/[name]-[hash][extname]",
            } = outputOptions;

            // Determine the correct to option for PostCSS by doing a bit of a dance
            let to;

            if(!outputOptions.file && !outputOptions.dir) {
                to = path.join(processor.options.cwd, assetFileNames);
            } else {
                to = path.join(
                    outputOptions.dir ? outputOptions.dir : path.dirname(outputOptions.file),
                    assetFileNames
                );
            }

            // Build chunk dependency graph
            const usage = new Graph({ circular : true });

            Object.entries(bundle).forEach(([ entry, chunk ]) => {
                const { imports, dynamicImports } = chunk;

                // Add all the nodes first, tagging them with their type for later
                imports.forEach((dep) => usage.addNode(dep, "static"));
                dynamicImports.forEach((dep) => usage.addNode(dep, "dynamic"));

                // Then tag the entry node
                usage.addNode(entry, "entry");

                // And then add all the dependency links
                [ ...dynamicImports, ...imports ].forEach((dep) =>
                    usage.addDependency(entry, dep)
                );
            });

            // Output CSS chunks
            const out = new Map();

            // Keep track of files that are queued to be written
            const queued = new Set();

            usage.overallOrder().forEach((entry) => {
                const { modules, name, fileName, isEntry } = bundle[entry];
                const css = new Set();

                // Get CSS files being used by this chunk
                const styles = Object.keys(modules).filter((file) => processor.has(file));

                // Get dependency chains for each css file & record them into the usage graph
                styles.forEach((style) => {
                    processor
                        .dependencies(style)
                        .forEach((file) => css.add(file));

                    css.add(style);
                });

                const included = [ ...css ].filter((file) => !queued.has(file));

                if(!included.length) {
                    return;
                }

                // Parse out the name part from the resulting filename,
                // based on the module's template (either entry or chunk)
                let dest;
                const template = isEntry ? entryFileNames : chunkFileNames;

                if(template.includes("[hash]")) {
                    const parts = parse(template, fileName);

                    dest = parts.name;
                } else {
                    // Want to use source chunk name when code-splitting, otherwise match bundle name
                    dest = outputOptions.dir ? name : path.basename(entry, path.extname(entry));
                }

                out.set(entry, {
                    name  : dest,
                    files : included
                });

                // Flag all the files that are queued for writing so they don't get double-output
                css.forEach((file) => queued.add(file));
            });

            // Figure out if there were any CSS files that the JS didn't reference
            const unused = processor
                .dependencies()
                .filter((css) => !queued.has(css));

            // Shove any unreferenced CSS files onto the beginning of the first chunk
            if(unused.length) {
                out.set("unused", {
                    // .css extension is added automatically down below, so strip in case it was specified
                    name         : common.replace(path.extname(common), ""),
                    files        : unused,
                    dependencies : [],
                });
            }

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

            for(const [ entry, value ] of out.entries()) {
                const { name, files } = value;

                const id = this.emitAsset(`${name}.css`);

                /* eslint-disable-next-line no-await-in-loop */
                const result = await processor.output({
                    // Can't use this.getAssetFileName() here, because the source hasn't been set yet
                    // Have to do our best to come up with a valid final location though...
                    to  : to.replace(/\[(name|extname)\]/g, (match, field) => (field === "name" ? name : ".css")),
                    map : mapOpt,

                    files,
                });

                log("css output", `${name}.css`);

                this.setAssetSource(id, result.css);

                // Save off the final name of this asset for later use
                const dest = this.getAssetFileName(id);

                // Maps can't be written out via the asset APIs becuase they shouldn't ever be hashed.
                // They shouldn't be hashed because they simply follow the name of their parent .css asset.
                // So add them to the bundle directly.
                if(result.map) {
                    // Make sure to use the rollup name as the base, otherwise it won't
                    // automatically handle duplicate names correctly
                    const fileName = dest.replace(".css", ".css.map");

                    log("map output", fileName);

                    bundle[fileName] = {
                        isAsset : true,
                        source  : result.map.toString(),
                        fileName,
                    };

                    // Had to re-add the map annotation to the end of the source files
                    // if the filename had a hash, since we stripped it out up above
                    if(assetFileNames.includes("hash")) {
                        bundle[dest].source += `\n/*# sourceMappingURL=${path.basename(fileName)} */`;
                    }
                }

                if(entry in bundle) {
                    // Attach info about this asset to the bundle
                    const { assets = [], dynamicAssets = [] } = bundle[entry];

                    if(usage.getNodeData(entry) === "dynamic") {
                        dynamicAssets.push(dest);
                    } else {
                        assets.push(dest);
                    }

                    bundle[entry].assets = assets;
                    bundle[entry].dynamicAssets = dynamicAssets;
                }
            }

            if(options.json) {
                const dest = typeof options.json === "string" ? options.json : "exports.json";

                log("json output", dest);

                const compositions = await processor.compositions;

                this.emitAsset(dest, JSON.stringify(compositions, null, 4));
            }

            if(options.meta) {
                const dest = typeof options.meta === "string" ? options.meta : "metadata.json";

                log("metadata output", dest);

                const meta = {};

                Object.entries(bundle).forEach(([ entry, { dynamicAssets = false, assets = false }]) => {
                    if(!assets && !dynamicAssets) {
                        return;
                    }

                    meta[entry] = {
                        assets,
                        dynamicAssets,
                    };
                });

                this.emitAsset(dest, JSON.stringify(meta, null, 4));
            }
        },
    };
};
