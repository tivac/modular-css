"use strict";

var fs   = require("fs"),
    path = require("path"),
    
    keyword = require("esutils").keyword,
    utils   = require("rollup-pluginutils"),
    mkdirp  = require("mkdirp"),
    
    plugin    = require("./plugin.js"),
    relative  = require("./lib/relative.js");

module.exports = function(opts) {
    var options = Object.assign(Object.create(null), {
            json : false,
            map  : true
        }, opts || {}),
        
        filter = utils.createFilter(options.include || "**/*.css", options.exclude),
        files  = Object.create(null),
        graph, css, json;
        
    if(!options.onwarn) {
        options.onwarn = console.warn.bind(console); // eslint-disable-line
    }

    return {
        name : "modular-css",

        transform : function(code, id) {
            if(!filter(id)) {
                return null;
            }

            // TODO: re-implement watch support!
            //
            // Remove this file if it's ever been processed before as a workaround
            // since rollup-watch never tells us what file changed
            // https://github.com/tivac/modular-css/issues/158
            // processor.remove(id, { shallow : true });

            // Process the file
            return plugin.process(code, Object.assign(
                Object.create(null),
                options,
                {
                    // PostCSS options
                    from : id,

                    // modular-css options
                    files : files,
                    graph : graph
                }
            ))
            .then((result) => {
                var key = relative(result.opts.cwd, id),
                    deps, exports;
                
                // Store output data for later
                css  = result.css;
                json = result.messages.find((msg) => (msg.name === "modular-css")).exports;

                // Store for re-use on subsequent runs
                // (to avoid parsing multiple times, and to ensure that all found files are output)
                graph = result.opts.graph;
                files = Object.assign(
                    files,
                    result.opts.files
                );

                // Create import statements to reflect CSS dependencies
                deps = result.opts.graph.dependenciesOf(id)
                    .map((file) => `import "${relative.prefixed(path.dirname(id), file)}";`);
                
                // Filter out & warn if any of the exported CSS names aren't
                // able to be used as a valid JS identifier. Turn the rest into
                // named exports for better tree-shaking
                exports = Object.keys(json[key])
                    .filter((name) => {
                        if(keyword.isReservedWordES6(name) || !keyword.isIdentifierNameES6(name)) {
                            options.onwarn(`Invalid JS identifier "${name}", unable to export`);

                            return false;
                        }

                        return true;
                    })
                    .map((name) => `export var ${name} = "${json[key][name]}";`);

                return {
                    code :
                        (deps.length ? deps.join("\n") + "\n" : "") +
                        (exports.length ? exports.join("\n") + "\n" : "") +
                        `export default ${JSON.stringify(json[key], null, 4)};\n`,
                        
                    // sourcemap doesn't make a ton of sense here, so always return nothing
                    // https://github.com/rollup/rollup/wiki/Plugins#conventions
                    map : {
                        mappings : ""
                    }
                };
            });
        },

        // Hook into bundle.generate()
        ongenerate : function(bundle, result) {
            result.css = {
                source  : css,
                exports : json
            };
        },

        // Hook into bundle.write()
        onwrite : function(bundle, result) {
            if(options.css) {
                mkdirp.sync(path.dirname(options.css));
                fs.writeFileSync(
                    options.css,
                    result.css.source
                );
            }
            
            if(options.json) {
                mkdirp.sync(path.dirname(options.json));
                fs.writeFileSync(
                    options.json,
                    JSON.stringify(result.css.exports, null, 4)
                );
            }
        }
    };
};
