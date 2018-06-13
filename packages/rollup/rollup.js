"use strict";

const path = require("path");

const keyword = require("esutils").keyword;
const utils   = require("rollup-pluginutils");
const slash   = require("slash");

const Processor = require("modular-css-core");
const output    = require("modular-css-core/lib/output.js");

// sourcemaps for css-to-js don't make much sense, so always return nothing
// https://github.com/rollup/rollup/wiki/Plugins#conventions
const map = {
    mappings : "",
};

function extensionless(file) {
    return path.join(path.dirname(file), path.basename(file, path.extname(file)));
}

module.exports = function(opts) {
    const options = Object.assign(Object.create(null), {
        common : false,
        
        json : false,
        map  : true,
        
        include : "**/*.css",

        namedExports : true
    }, opts);
        
    const filter = utils.createFilter(options.include, options.exclude);
        
    const processor = options.processor || new Processor(options);
    
    let runs = 0;
        
    return {
        name : "modular-css",

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
                        `import "${slash(file)}";`
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
            const bundles = [];
            const common  = processor.dependencies();

            Object.keys(bundle).forEach((entry) => {
                const files = Object.keys(bundle[entry].modules).filter(filter);

                if(!files.length) {
                    return;
                }

                // remove the files being exported from the common bundle
                files.forEach((file) =>
                    common.splice(common.indexOf(file), 1)
                );

                bundles.push({
                    entry,
                    files,
                    base : extensionless(entry),
                });
            });

            // Common chunk only emitted if configured & if necessary
            if(options.common && common.length) {
                bundles.push({
                    entry : options.common,
                    base  : extensionless(options.common),
                    files : common
                });
            }
            
            await Promise.all(
                bundles.map(async ({ base, files }) => {
                    const css = this.emitAsset(`${base}.css`);
                    
                    const result = await processor.output({
                        to : css,
                        files
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
