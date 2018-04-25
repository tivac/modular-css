"use strict";

const fs   = require("fs");
const path = require("path");

const keyword = require("esutils").keyword;
const utils   = require("rollup-pluginutils");
const mkdirp  = require("mkdirp");

const Processor = require("modular-css-core");
const output    = require("modular-css-core/lib/output.js");

// sourcemaps for css-to-js don't make much sense, so always return nothing
// https://github.com/rollup/rollup/wiki/Plugins#conventions
const map = {
    mappings : "",
};

module.exports = function(opts) {
    const options = Object.assign(Object.create(null), {
        ext          : ".css",
        json         : false,
        map          : true,
        namedExports : true
    }, opts);
        
    const slice = -1 * options.ext.length;
        
    const filter = utils.createFilter(options.include, options.exclude);
        
    let processor = new Processor(options);
    let runs = 0;
    let source;
        
    if(!options.onwarn) {
        options.onwarn = console.warn.bind(console); // eslint-disable-line
    }

    return {
        name : "modular-css",

        options : ({ input }) => {
            source = input;
        },

        transform : function(code, id) {
            let removed;

            if(!filter(id) || id.slice(slice) !== options.ext) {
                return null;
            }

            // If the file is being re-processed we need to remove it to
            // avoid cache staleness issues
            if(runs) {
                removed = processor.remove(id);
            } else {
                removed = [];
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
                        options.onwarn(`Invalid JS identifier "${ident}", unable to export`);
                        
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

        // Hook for when bundle.generate() is called
        ongenerate : function(bundle, result) {
            runs++;
            
            result.css = processor.output({
                from : source,
                to   : options.css
            });
        },

        onwrite : function(bundle, result) {
            return result.css.then((data) => {
                if(options.css) {
                    mkdirp.sync(path.dirname(options.css));
                    
                    fs.writeFileSync(
                        options.css,
                        data.css
                    );
                }

                if(options.css && data.map) {
                    mkdirp.sync(path.dirname(options.css));

                    fs.writeFileSync(
                        `${options.css}.map`,
                        data.map.toString()
                    );
                }
                
                if(options.json) {
                    mkdirp.sync(path.dirname(options.json));
                    
                    fs.writeFileSync(
                        options.json,
                        JSON.stringify(data.compositions, null, 4)
                    );
                }
            });
        }
    };
};
