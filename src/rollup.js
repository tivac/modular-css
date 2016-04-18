"use strict";

var fs   = require("fs"),
    path = require("path"),
    
    keyword = require("esutils").keyword,
    utils   = require("rollup-pluginutils"),
    assign  = require("lodash.assign"),
    mkdirp  = require("mkdirp"),
    
    Processor = require("./processor"),
    output    = require("./_output");

module.exports = function(opts) {
    var options = assign({
            ext  : ".css",
            json : false
        }, opts || {}),
        
        slice = -1 * options.ext.length,
        
        filter = utils.createFilter(options.include, options.exclude),
        
        processor = new Processor(options);
        
    if(!options.onwarn) {
        options.onwarn = console.warn.bind(console); // eslint-disable-line
    }
        
    return {
        transform : function(code, id) {
            if(!filter(id) || id.slice(slice) !== options.ext) {
                return null;
            }
            
            return processor.string(id, code).then(function(result) {
                return {
                    code : Object.keys(result.exports).reduce(function(prev, curr) {
                        // Warn if any of the exported CSS wasn't able to be used as a valid JS identifier
                        if(keyword.isReservedWordES6(curr) || !keyword.isIdentifierNameES6(curr)) {
                            options.onwarn("Invalid JS identifier \"" + curr + "\", unable to export");
                            
                            return prev;
                        }
                        
                        return "export var " + curr + " = \"" + result.exports[curr] + "\";\n" + prev;
                    }, "export default " + JSON.stringify(result.exports, null, 4) + ";\n")
                };
            });
        },
        
        // This is a bit of a hack, see this rollup PR for details
        // https://github.com/rollup/rollup/pull/353#issuecomment-164358181
        footer : function() {
            mkdirp.sync(path.dirname(options.css));
            
            // Write out common/all css depending on bundling status
            processor.output({
                to : options.css
            })
            .then(function(result) {
                fs.writeFileSync(options.css, result.css);
            });
            
            if(options.json) {
                mkdirp.sync(path.dirname(options.json));
                
                fs.writeFileSync(
                    options.json,
                    JSON.stringify(output.compositions(process.cwd(), processor), null, 4)
                );
            }
        }
    };
};
