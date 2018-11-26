/* eslint max-statements: [ 1, 30 ] */
"use strict";

const path = require("path");

const { keyword } = require("esutils");
const utils = require("rollup-pluginutils");
const dedent = require("dedent");
const slash = require("slash");

const Processor = require("@modular-css/processor");
const output = require("@modular-css/processor/lib/output.js");

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

module.exports = (opts) => {
    const options = Object.assign(Object.create(null), {
        common       : "common.css",
        json         : false,
        include      : "**/*.css",
        namedExports : true,
        styleExport  : false,
        dev          : false,
        verbose      : false,
    }, opts);

    const filter = utils.createFilter(options.include, options.exclude);

    const { styleExport, done, map, dev, verbose } = options;

    // eslint-disable-next-line no-console, no-empty-function
    const log = verbose ? console.log.bind(console, "[rollup]") : () => { };

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
            if(!processor.files[ file ]) {
                return;
            }

            log("file changed", file);

            processor.dependents(file).forEach((dep) =>
                processor.remove(dep)
            );

            processor.remove(file);
        },

        async transform(code, id) {
            if(!filter(id)) {
                return null;
            }

            log("transform", id);

            const { details, exports } = await processor.string(id, code);

            const exported = output.join(exports);

            const out = [
                ...processor.dependencies(id).map((dep) => `import ${JSON.stringify(dep)};`),
                dev ? dedent(`
                    const data = ${JSON.stringify(exported)};

                    export default new Proxy(data, {
                        get(tgt, key) {
                            if(key in tgt) {
                                return tgt[key];
                            }

                            throw new ReferenceError(
                                key + " is not exported by " + ${JSON.stringify(
                        slash(path.relative(process.cwd(), id))
                    )}
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
            const files = new Map();

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
                const name = path.basename(entry, path.extname(entry));

                const file = {
                    entry,
                    name,
                    base : path.join(path.dirname(entry), name),
                    css  : new Set(),
                };

                const { imports, modules } = bundle;

                // Get CSS files being used by each entry point
                const css = Object.keys(modules).filter(filter);

                // Get dependency chains for each file
                css.forEach((start) => {
                    const used = [
                        ...processor.dependencies(start),
                        start,
                    ];

                    used.forEach((dep) => {
                        if(!usage.has(dep)) {
                            usage.set(dep, new Set());
                        }

                        const users = usage.get(dep).add(entry);

                        // CSS included in this chunk only if not already included
                        // by one of its imports
                        if(imports.some((f) => users.has(f))) {
                            return;
                        }

                        file.css.add(dep);
                    });
                });

                files.set(entry, file);
            });

            // TODO: Ensure that all CSS files only appear in a single bundle

            console.log("BUNDLES");
            Object.entries(bundles).forEach(([ key, bundle ]) => {
                console.log(key);
                // console.log(Object.keys(modules));
                console.log(bundle);
            });
            console.log("\n\n\n");

            console.log("CSS");
            console.log(files);
            console.log("\n\n\n");

            console.log("USAGE");
            console.log(usage);

            for(const [ , { base, name, css }] of files) {
                if(!css.size) {
                    continue;
                }

                const id = this.emitAsset(`${base}.css`);

                log("css output", id);

                /* eslint-disable-next-line no-await-in-loop */
                const result = await processor.output({
                    to : to.replace(/\[(name|extname)\]/g, (match, field) =>
                        (field === "name" ? name : ".css")
                    ),
                    files : [ ...css ],
                });

                this.setAssetSource(id, result.css);

                if(result.map) {
                    const dest = `${base}.css.map`;

                    log("map output", dest);

                    this.emitAsset(dest, result.map.toString());
                }
            }

            // result.compositions always includes all the info, so it
            // doesn't actually matter which result we use. First one seems reasonable!
            if(options.json) {
                const dest = typeof options.json === "string" ? options.json : "exports.json";

                log("json output", dest);

                const compositions = await processor.compositions;

                this.emitAsset(dest, JSON.stringify(compositions, null, 4));
            }
        },
    };
};
