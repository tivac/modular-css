/* eslint max-statements: [ 1, 20 ] */
"use strict";

const path = require("path");

const { keyword } = require("esutils");

const utils   = require("rollup-pluginutils");

const Processor = require("modular-css-core");
const output    = require("modular-css-core/lib/output.js");

// sourcemaps for css-to-js don't make much sense, so always return nothing
// https://github.com/rollup/rollup/wiki/Plugins#conventions
const emptyMappings = {
    mappings : "",
};

const makeFile = (details) => {
    const { entry } = details;
    const name = path.basename(entry, path.extname(entry));

    return Object.assign(details, {
        base : path.join(path.dirname(entry), name),
        name,
    });
};

module.exports = function(opts) {
    const options = Object.assign(Object.create(null), {
        common       : "common.css",
        json         : false,
        include      : "**/*.css",
        namedExports : true,
        styleExport  : false,
    }, opts);
        
    const filter = utils.createFilter(options.include, options.exclude);

    const { styleExport, done, map } = options;

    if(typeof map === "undefined") {
        // Sourcemaps don't make much sense in styleExport mode
        // But default to true otherwise
        options.map = !styleExport;
    }
    
    const processor = options.processor || new Processor(options);

    return {
        name : "modular-css-rollup",

        buildStart() {
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
            if(!processor.files[file]) {
                return;
            }

            processor.dependents(file).forEach((dep) =>
                processor.remove(dep)
            );

            processor.remove(file);
        },

        async transform(code, id) {
            if(!filter(id)) {
                return null;
            }

            const { details, exports } = await processor.string(id, code);

            const exported = output.join(exports);

            const out = [
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

            if(options.styleExport) {
                out.push(`export var styles = ${JSON.stringify(details.result.css)};`);
            }

            return {
                code         : out.join("\n"),
                map          : emptyMappings,
                dependencies : processor.dependencies(id),
            };
        },

        async generateBundle(outputOptions, bundles) {
            // styleExport disables all output file generation
            if(styleExport) {
                return;
            }

            const usage = new Map();
            const common = new Map();
            const files = [];

            const { assetFileNames = "" } = outputOptions;
            
            let to;

            if(!outputOptions.file && !outputOptions.dir) {
                to = path.join(process.cwd(), assetFileNames);
            } else {
                to = path.join(
                    outputOptions.dir ? outputOptions.dir : path.dirname(outputOptions.file),
                    assetFileNames
                );
            }

            // First pass is used to calculate JS usage of CSS dependencies
            Object.entries(bundles).forEach(([ entry, bundle ]) => {
                const file = makeFile({
                    entry,
                    css : new Set(),
                });

                const { modules } = bundle;

                // Get CSS files being used by each entry point
                const css = Object.keys(modules).filter(filter);

                // Get dependency chains for each file
                css.forEach((start) => {
                    const used = [
                        ...processor.dependencies(start),
                        start,
                    ];

                    used.forEach((dep) => {
                        file.css.add(dep);

                        if(!usage.has(dep)) {
                            usage.set(dep, new Set());
                        }

                        usage.get(dep).add(entry);
                    });
                });

                files.push(file);
            });

            if(files.length === 1) {
                // Only one entry file means we only need one bundle.
                files[0].css = new Set(processor.dependencies());
            } else {
                // Multiple bundles means ref-counting to find the shared deps
                // Second pass removes any dependencies appearing in multiple bundles
                files.forEach((file) => {
                    const { css } = file;

                    file.css = new Set([ ...css ].filter((dep) => {
                        if(usage.get(dep).size > 1) {
                            common.set(dep, true);

                            return false;
                        }

                        return true;
                    }));
                });

                // Add any other files that weren't part of a bundle to the common chunk
                Object.keys(processor.files).forEach((file) => {
                    if(!usage.has(file)) {
                        common.set(file, true);
                    }
                });

                // Common chunk only emitted if necessary
                if(common.size) {
                    files.push(makeFile({
                        entry : options.common,
                        css   : new Set([ ...common.keys() ]),
                    }));
                }
            }

            await Promise.all(
                files
                .filter(({ css }) => css.size)
                .map(async ({ base, name, css }, idx) => {
                    const id = this.emitAsset(`${base}.css`);

                    const result = await processor.output({
                        to : to.replace(/\[(name|extname)\]/g, (match, field) =>
                            (field === "name" ? name : ".css")
                        ),
                        files : [ ...css ],
                    });

                    this.setAssetSource(id, result.css);

                    // result.compositions always includes all the info, so it
                    // doesn't actually matter which result we use. First one seems reasonable!
                    if(options.json && idx === 0) {
                        const file = typeof options.json === "string" ? options.json : "exports.json";

                        this.emitAsset(file, JSON.stringify(result.compositions, null, 4));
                    }

                    if(result.map) {
                        this.emitAsset(`${base}.css.map`, result.map.toString());
                    }
                })
            );
        },
    };
};
