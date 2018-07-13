/* eslint max-statements: [ 1, 20 ] */
"use strict";

const path = require("path");

const { keyword } = require("esutils");

const utils   = require("rollup-pluginutils");

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
        common : "common.css",
        
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

        async transform(code, id) {
            if(!filter(id)) {
                return null;
            }

            // Is this file being processed on a watch update?
            if(runs && (id in processor.files)) {
                // Watching will call transform w/ the same entry file, even if it
                // was one of its dependencies that changed. We need to fork the logic
                // here to handle that case.
                let files;

                if(processor.files[id].text === code) {
                    // Dependency changed, remove all the dependencies and all their individual
                    // dependents and then re-process them
                    files = processor.dependencies(id);

                    files.forEach((file) => {
                        const dependents = processor.dependents(file);

                        files.push(...dependents);
                    });
                } else {
                    // Entry file changed, remove all its dependents and
                    // then re-process them
                    files = processor.dependents(id);
                    
                    processor.remove(id);
                }
                                    
                files.forEach((file) => processor.remove(file));
                    
                await Promise.all(files.map((dep) =>
                    processor.file(dep)
                ));
            }
            
            const result = await processor.string(id, code);
            
            const exported = output.join(result.exports);
            
            const out = [
                `export default ${JSON.stringify(exported, null, 4)};`,
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
        },

        // Track # of runs since remove functionality needs to change
        buildEnd() {
            runs++;
        },

        async generateBundle(outputOptions, bundles) {
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
            Object.keys(bundles).forEach((entry) => {
                const file = {
                    entry,

                    base : extensionless(entry),
                    css  : [],
                };

                // Get CSS files being used by each entry point
                const css = Object.keys(bundles[entry].modules).filter(filter);

                if(!css.length) {
                    return;
                }

                // Get dependency chains for each file
                css.forEach((start) => {
                    const used = [
                        ...processor.dependencies(start),
                        start,
                    ];

                    file.css.push(...used);

                    used.forEach((dep) => {
                        usage.set(dep, (usage.get(dep) || 0) + 1);
                    });
                });

                files.push(file);
            });

            if(files.length === 1) {
                // Only one entry file means we only need one bundle.
                files[0].css = processor.dependencies();
            } else {
                // Multiple bundles means ref-counting to find the shared deps
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

                // Add any other files that weren't part of a bundle to the common chunk
                Object.keys(processor.files).forEach((file) => {
                    if(!usage.has(file)) {
                        common.set(file, true);
                    }
                });

                // Common chunk only emitted if necessary
                if(common.size) {
                    files.push({
                        entry : options.common,
                        base  : extensionless(options.common),
                        css   : [ ...common.keys() ],
                    });
                }
            }

            await Promise.all(
                files
                .filter(({ css }) => css.length)
                .map(async ({ base, css }) => {
                    const id = this.emitAsset(`${base}.css`);

                    const result = await processor.output({
                        to,
                        files : css,
                    });
                    
                    this.setAssetSource(id, result.css);

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
