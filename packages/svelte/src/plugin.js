"use strict";

const path = require("path");

const utils = require("rollup-pluginutils");
const slash = require("slash");

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
        json   : false,
        map    : true,
        
        include : "**/*.css",
    }, opts);
        
    const filter = utils.createFilter(options.include, options.exclude);
    const { processor } = options;
        
    let runs = 0;
    let source;
        
    return {
        name : "modular-css-svelte",

        options({ input }) {
            source = input;
        },

        transform : function(code, id) {
            if(!filter(id)) {
                return null;
            }
            
            let removed = [];

            // If the file is being re-processed we need to remove it to
            // avoid cache staleness issues
            if(runs) {
                removed = processor.remove(id);
            }

            return Promise.all(
                // Run current file first since it's already in-memory
                [ processor.string(id, code) ].concat(
                    removed.map((file) => processor.file(file))
                )
            )
            .then(() => {
                // Add dependencies
                const out = processor.dependencies(id).map((file) =>
                    `import "${slash(file)}";`
                );

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
                    // TODO: docs say that empty string arg to .emitAsset() shouldn't be required
                    // https://github.com/rollup/rollup/wiki/Plugins#plugin-context
                    const css = this.emitAsset(`${base}.css`, "");
                    
                    const result = await processor.output({
                        from : source,
                        to   : css,
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
