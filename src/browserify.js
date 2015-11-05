"use strict";

var fs   = require("fs"),
    path = require("path"),

    through = require("through2"),
    
    assign  = require("lodash.assign"),
    diff    = require("lodash.difference"),
    each    = require("lodash.foreach"),
    flatten = require("lodash.flatten"),
    map     = require("lodash.mapvalues"),
    unique  = require("lodash.uniq"),
    
    Processor = require("./processor"),
    relative  = require("./relative");

module.exports = function(browserify, opts) {
    var options = assign({
            ext  : ".css",
            css  : false,
            json : false
        }, opts),
        
        processor = new Processor(),
        bundles   = {},
        common    = [];

    if(!options.ext || options.ext.charAt(0) !== ".") {
        return browserify.emit("error", "Missing or invalid \"ext\" option: " + options.ext);
    }

    browserify.transform(function(file) {
        var buffer;

        if(path.extname(file) !== options.ext) {
            return through();
        }
        
        common.push(relative(file));
        buffer = "";
        
        return through(
            function(chunk, enc, done) {
                buffer += chunk.toString("utf8");
                
                done();
            },
            
            function(done) {
                var result = processor.string(file, buffer);
                
                this.push("module.exports = " + JSON.stringify(result.exports) + ";");
                
                done();
            }
        );
    }, { global : true });

    browserify.on("factor.pipeline", function(file, pipeline) {
        var identifier = relative(file);
        
        bundles[identifier] = [];

        // Keep track of the files in each bundle so we can determine commonalities
        // later and output CSS bundles
        pipeline.unshift(through.obj(function(obj, enc, done) {
            if(path.extname(obj.file) === options.ext) {
                bundles[identifier].push(relative(obj.file));
            }

            this.push(obj);

            done();
        }));
    });
    
    browserify.on("bundle", function(bundler) {
        bundler.on("end", function() {
            var usage    = {},
                bundling = Object.keys(bundles).length > 0;
            
            if(options.json) {
                fs.writeFileSync(options.json, JSON.stringify(map(processor.files, function(file) {
                    return file.compositions;
                })));
            }
            
            if(!options.css) {
                return;
            }
            
            if(bundling) {
                // Calculate usages of each CSS file across all bundles
                processor.dependencies().forEach(function(file) {
                    usage[file] = 0;
                });
                
                each(bundles, function(contents) {
                    contents.forEach(function(file) {
                        usage[file]++;
                        
                        processor.dependencies(file).forEach(function(dep) {
                            usage[dep]++;
                        });
                    });
                });
                
                // only include files used more than once
                common = unique(flatten(
                    common.map(function(file) {
                        return usage[file] > 1 ? processor.dependencies(file).concat(file) : [];
                    })
                ));
                
                // Write out each bundle's CSS files (if they have any)
                each(bundles, function(contents, bundle) {
                    var css = [];
                    
                    contents.forEach(function(file) {
                        css = css.concat(processor.dependencies(file), file);
                    });
                    
                    css = diff(css, common);
                    
                    if(!css.length) {
                        return;
                    }
                    
                    fs.writeFileSync(
                        path.join(path.dirname(options.css), path.basename(bundle).replace(path.extname(bundle), options.ext)),
                        processor.css(css)
                    );
                });
            }
            
            // Write out common/all css depending on bundling status
            fs.writeFileSync(options.css, processor.css(bundling ? common : false));
        });
    });
};
