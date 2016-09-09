"use strict";

var fs   = require("fs"),
    path = require("path"),
    
    keyword = require("esutils").keyword,
    utils   = require("rollup-pluginutils"),
    assign  = require("lodash.assign"),
    mkdirp  = require("mkdirp"),
    
    Processor = require("./processor"),
    output    = require("./lib/output"),
    relative  = require("./lib/relative");

module.exports = function(opts) {
    var options = assign({
            ext  : ".css",
            json : false,
            map  : true
        }, opts || {}),
        
        slice = -1 * options.ext.length,
        
        filter = utils.createFilter(options.include, options.exclude),
        
        processor;
        
    if(!options.onwarn) {
        options.onwarn = console.warn.bind(console); // eslint-disable-line
    }
    
    return {
        name : "modular-css",

        transform : function(code, id) {
            if(!filter(id) || id.slice(slice) !== options.ext) {
                return null;
            }

            // JIT processor creation to support dumping it at the end of each generation pass
            // since rollup-watch doesn't notify us which files have changed
            // https://github.com/tivac/modular-css/issues/158
            if(!processor) {
                 processor = new Processor(options);
            }
            
            return processor.string(id, code).then(function(result) {
                var classes = output.join(result.exports),
                    imports = processor.dependencies(id)
                        .map(function(file) {
                            return "import \"" + relative.prefixed(path.dirname(id), file) + "\";";
                        })
                        .join("\n");

                return {
                    code : (imports.length ? imports + "\n" : "") + Object.keys(classes).reduce(function(prev, curr) {
                        // Warn if any of the exported CSS wasn't able to be used as a valid JS identifier
                        if(keyword.isReservedWordES6(curr) || !keyword.isIdentifierNameES6(curr)) {
                            options.onwarn("Invalid JS identifier \"" + curr + "\", unable to export");
                            
                            return prev;
                        }
                        
                        return "export var " + curr + " = \"" + classes[curr] + "\";\n" + prev;
                    }, "export default " + JSON.stringify(classes, null, 4) + ";\n"),
                    
                    // sourcemap doesn't make a ton of sense here, so always return nothing
                    // https://github.com/rollup/rollup/wiki/Plugins#conventions
                    map : {
                        mappings : ""
                    }
                };
            });
        },

        // Hook for when bundle.generate() is called
        ongenerate : function(bundle, result) {
            result.css = processor.output({
                to : options.css
            })
            .then(function(data) {
                // Remove our reference to the processor so it'll be re-created on the next run
                processor = null;

                return data;
            });
        },

        onwrite : function(bundle, result) {
            result.css.then(function(data) {
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
            })
            .catch(function(error) {
                throw error;
            });
        }
    };
};
