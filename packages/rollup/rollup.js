"use strict";

const path = require("path");

const keyword = require("esutils").keyword;
const utils   = require("rollup-pluginutils");

const Processor = require("modular-css-core");
const output    = require("modular-css-core/lib/output.js");

// sourcemaps for css-to-js don't make much sense, so always return nothing
// https://github.com/rollup/rollup/wiki/Plugins#conventions
const map = {
    mappings : "",
};

module.exports = function(opts) {
    const options = Object.assign(Object.create(null), {
        json : false,
        map  : true,
        
        include : "**/*.css",

        namedExports : true
    }, opts);
        
    const filter = utils.createFilter(options.include, options.exclude);
        
    let runs = 0;
    let processor = new Processor(options);
    let source;
        
    return {
        name : "modular-css",

        options({ input }) {
            source = input;
        },

        transform : function(code, id) {
            let removed = [];

            if(!filter(id)) {
                return null;
            }

            // If the file is being re-processed we need to remove it to
            // avoid cache staleness issues
            if(runs) {
                removed = processor.remove(id);
            }

            return Promise.all(
                // Run current file first since it's already in-memory
                [ processor.string(id, code) ].concat(
                    removed.map((file) =>
                        processor.file(file)
                    )
                )
            )
            .then((results) => {
                const [ result ] = results;
                const exported = output.join(result.exports);
                
                let out = [
                    `export default ${JSON.stringify(exported, null, 4)};`
                ];
                
                // Add dependencies
                out = out.concat(
                    processor.dependencies(id).map((file) =>
                        `import "${file.replace(/\\/g, "/")}";`
                    )
                );

                if(options.namedExports === false) {
                    return {
                        code : out.join("\n"),
                        map
                    };
                }

                Object.keys(exported).forEach((ident) => {
                    if(keyword.isReservedWordES6(ident) || !keyword.isIdentifierNameES6(ident)) {
                        this.warn(`Invalid JS identifier "${ident}", unable to export`);
                        
                        return;
                    }

                    out.push(`export var ${ident} = ${JSON.stringify(exported[ident])};`);
                });

                return {
                    code : out.join("\n"),
                    map
                };
            });
        },
        
        buildEnd() {
            runs++;
        },

        generateBundle : async function(outputOptions, bundle) {
            await Promise.all(
                Object.keys(bundle).map(async (entry) => {
                    const base = path.basename(entry, path.extname(entry));
                    const files = Object.keys(bundle[entry].modules).filter(filter);

                    // No point continuing if nothing to output!
                    if(!files.length) {
                        return;
                    }

                    // TODO: docs say that empty string arg to .emitAsset() shouldn't be required
                    // https://github.com/rollup/rollup/wiki/Plugins#plugin-context
                    const css = this.emitAsset(`${base}.css`, "");
                    
                    const result = await processor.output({
                        from : source,
                        to   : css,

                        // Only export for files within this bundle
                        files : Object.keys(bundle[entry].modules).filter(filter)
                    });
                    
                    this.setAssetSource(css, result.css);

                    if(options.json) {
                        this.emitAsset(`${base}.json`, JSON.stringify(result.compositions, null, 4));
                    }

                    if(result.map) {
                        this.emitAsset(`${base}.css.map`, result.map.toString());
                    }
                })
            );
        },
    };
};
