"use strict";

var fs   = require("fs"),
    path = require("path"),
    
    keyword = require("esutils").keyword,
    utils   = require("rollup-pluginutils"),
    mkdirp  = require("mkdirp"),
    
    Processor = require("modular-css-core"),
    output    = require("modular-css-core/lib/output.js"),
    
    // sourcemaps for css-to-js don't make much sense, so always return nothing
    // https://github.com/rollup/rollup/wiki/Plugins#conventions
    map = {
        mappings : ""
    };

module.exports = function(opts) {
    var options = Object.assign(Object.create(null), {
            ext          : ".css",
            json         : false,
            map          : true,
            namedExports : true
        }, opts || {}),
        
        slice = -1 * options.ext.length,
        
        filter = utils.createFilter(options.include, options.exclude),
        
        processor = new Processor(options),
        
        runs = 0;
        
    if(!options.onwarn) {
        options.onwarn = console.warn.bind(console); // eslint-disable-line
    }

    return {
        name : "modular-css",

        transform : function(code, id) {
            var removed;

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
                var result  = results[0],
                    classes = output.join(result.exports),
                    named   = Object.keys(classes),
                    out     = [
                        `export default ${JSON.stringify(classes, null, 4)};`
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

                named.forEach((ident) => {
                    if(keyword.isReservedWordES6(ident) || !keyword.isIdentifierNameES6(ident)) {
                        options.onwarn(`Invalid JS identifier "${ident}", unable to export`);
                        
                        return;
                    }

                    out.push(`export var ${ident} = "${classes[ident]}";`);
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
                to : options.css
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
