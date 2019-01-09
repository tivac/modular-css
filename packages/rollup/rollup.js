/* eslint-disable max-statements */
"use strict";

const path = require("path");

const { keyword } = require("esutils");
const utils = require("rollup-pluginutils");
const dedent = require("dedent");
const slash = require("slash");
const Graph = require("dependency-graph").DepGraph;

const Processor = require("@modular-css/processor");
const output = require("@modular-css/processor/lib/output.js");

// sourcemaps for css-to-js don't make much sense, so always return nothing
// https://github.com/rollup/rollup/wiki/Plugins#conventions
const emptyMappings = {
    mappings : "",
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

        async generateBundle(outputOptions, chunks) {
            // styleExport disables all output file generation
            if(styleExport) {
                return;
            }

            const { assetFileNames = "" } = outputOptions;

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

            // Build chunk dependency graph so it can be walked in order later to
            // Allow for outputting CSS alongside chunks as optimally as possible
            const usage = new Graph();

            Object.entries(chunks).forEach(([ entry, chunk ]) => {
                const { imports, dynamicImports } = chunk;

                usage.addNode(entry, true);

                [ ...imports, ...dynamicImports ].forEach((dep) => {
                    usage.addNode(dep, true);
                    usage.addDependency(entry, dep);
                });
            });

            // Output CSS chunks
            const out = new Map();

            // Keep track of files that are queued to be written
            const queued = new Set();

            usage.overallOrder().forEach((entry) => {
                const { modules, name } = chunks[entry];
                const css = new Set();
                let counter = 1;

                // Get CSS files being used by this chunk
                const styles = Object.keys(modules).filter((file) => processor.has(file));

                // Get dependency chains for each css file & record them into the usage graph
                styles.forEach((style) => {
                    processor
                        .dependencies(style)
                        .forEach((file) => css.add(file));
                    
                    css.add(style);
                });

                // Want to use source chunk name when code-splitting, otherwise match bundle name
                let identifier = outputOptions.dir ? name : path.basename(entry, path.extname(entry));

                // Replicate rollup chunk name de-duping logic here since that isn't exposed for us
                while(out.has(identifier)) {
                    identifier = `${identifier}${++counter}`;
                }

                // Set up the CSS chunk to be written
                out.set(
                    identifier,
                    [ ...css ].filter((file) => !queued.has(file))
                );

                // Flag all the files that are queued for writing so they don't get double-output
                css.forEach((file) => queued.add(file));
            });

            // Shove any unreferenced CSS files onto the beginning of the first chunk
            // TODO: this is inelegant, but seems reasonable-ish
            processor.dependencies().forEach((css) => {
                if(queued.has(css)) {
                    return;
                }

                out.values().next().value.unshift(css);
                queued.add(css);
            });

            for(const [ name, files ] of out.entries()) {
                if(!files.length) {
                    continue;
                }

                const id = this.emitAsset(`${name}.css`);

                /* eslint-disable-next-line no-await-in-loop */
                const result = await processor.output({
                    to : to.replace(/\[(name|extname)\]/g, (match, field) =>
                        (field === "name" ? name : ".css")
                    ),
                    files,
                });

                log("css output", `${name}.css`);

                this.setAssetSource(id, result.css);

                if(result.map) {
                    const dest = `${name}.css.map`;

                    log("map output", dest);

                    this.emitAsset(dest, result.map.toString());
                }
            }

            if(options.json) {
                const dest = typeof options.json === "string" ? options.json : "exports.json";

                log("json output", dest);

                const compositions = await processor.compositions;

                this.emitAsset(dest, JSON.stringify(compositions, null, 4));
            }
        },
    };
};
