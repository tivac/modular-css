"use strict";

const path = require("path");

const { keyword } = require("esutils");

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

        namedExports : true,
    }, opts);
        
    const filter = utils.createFilter(options.include, options.exclude);
        
    const processor = options.processor || new Processor(options);
    
    let runs = 0;
        
    return {
        name : "modular-css-rollup",

        transform(code, id) {
            let removed = [];

            if(!filter(id)) {
                return null;
            }

            // If the file is being re-processed we need to remove it to
            // avoid cache staleness issues

            // TODO: this has to REMOVE EVERYTHING, id will be the original file that
            // was updated if ANY of its dependencies has been changed
            if(runs) {
                removed = processor.remove(id);
            }

            // console.log(removed);

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
                
                const out = [
                    `export default ${JSON.stringify(exported, null, 4)};`
                ];

                if(options.namedExports) {
                    Object.keys(exported).forEach((ident) => {
                        if(keyword.isReservedWordES6(ident) || !keyword.isIdentifierNameES6(ident)) {
                            this.warn(`Invalid JS identifier "${ident}", unable to export`);
                            
                            return;
                        }
                        
                        out.push(`export var ${ident} = ${JSON.stringify(exported[ident])};`);
                    });
                }

                const dependencies = processor.dependencies(id);
                    
                return {
                    code : out.join("\n"),
                    map,
                    dependencies,
                };
            });
        },

        buildEnd() {
            runs++;
        },

        generateBundle : async function(outputOptions, bundles) {
            const usage = new Map();
            const common = new Map();
            const files = [];

            const entries = Object.keys(bundles);

            // First pass is used to calculate usage of CSS dependencies
            entries.forEach((entry) => {
                const file = {
                    entry,
                    base : extensionless(entry),

                    css : [ ]
                };

                // Get CSS files being used by each entry point
                const css = Object.keys(bundles[entry].modules).filter(filter);

                if(!css.length) {
                    return;
                }

                // Get dependency chains for each file
                css.forEach((start) => {
                    const deps = processor.dependencies(start);

                    const used = deps.concat(css);
                    
                    file.css = file.css.concat(used);

                    used.forEach((dep) => {
                        usage.set(dep, usage.has(dep) ? usage.get(dep) + 1 : 1);
                    });
                });

                files.push(file);
            });

            // Second pass removes any dependencies appearing in multiple bundles
            files.forEach((file) => {
                const { css } = file;

                file.css = css.filter((dep) => {
                    if(usage.get(dep) > 1) {
                        common.set(dep, true);

                        return false;
                    }

                    return true;
                });
            });

            // Common chunk only emitted if configured & if necessary
            if(options.common && common.size) {
                files.push({
                    entry : options.common,
                    base  : extensionless(options.common),
                    css   : [ ...common.keys() ]
                });
            }
            
            // console.log(files);

            await Promise.all(
                files
                .filter(({ css }) => css.length)
                .map(async ({ base, css }) => {
                    const dest = this.emitAsset(`${base}.css`);
                    
                    const result = await processor.output({
                        // TODO: This doesn't work until the asset has a source
                        // but this call to processor.output() creates the source...
                        // so now what?
                        to    : dest, // this.getAssetFileName(css),
                        files : css
                    });
                    
                    this.setAssetSource(dest, result.css);

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
