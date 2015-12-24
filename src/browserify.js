"use strict";

var fs   = require("fs"),
    path = require("path"),

    through = require("through2"),
    sink    = require("sink-transform"),
    
    assign  = require("lodash.assign"),
    each    = require("lodash.foreach"),
    map     = require("lodash.mapvalues"),
    
    Processor = require("./processor"),
    relative  = require("./_relative");

module.exports = function(browserify, opts) {
    var options = assign({
            ext    : ".css",
            css    : false,
            json   : false,
            prefix : false,
            namer  : false,
            empty  : false
        }, opts),
        
        processor = new Processor(options),

        bundles;

    if(!options.ext || options.ext.charAt(0) !== ".") {
        return browserify.emit("error", "Missing or invalid \"ext\" option: " + options.ext);
    }

    browserify.transform(function(file) {
        var identifier;

        if(path.extname(file) !== options.ext) {
            return through();
        }

        identifier = relative(file);
        
        return sink.str(function(buffer, done) {
            var result = processor.string(file, buffer),
                output;
            
            output = processor.dependencies(identifier).map(function(short) {
                var long = path.resolve(process.cwd(), short);
                
                // I hate you, path.
                return "require(\"" + long.replace(/\\/g, "/") + "\");";
            });
            
            output = output.concat("module.exports = " + JSON.stringify(result.exports, null, 4) + ";");
            
            this.push(output.join("\n"));
            
            done();
        });
    }, { global : true });

    browserify.on("factor.pipeline", function(file, pipeline) {
        var identifier = relative(file);
        
        bundles[identifier] = [];

        // Keep track of the files in each bundle so we can determine commonalities
        // Doesn't actually modify the file though, just records it
        pipeline.unshift(through.obj(function(obj, enc, done) {
            var child;
            
            if(path.extname(obj.file) === options.ext) {
                child = relative(obj.file);
                
                bundles[identifier].unshift(child);
            }

            this.push(obj);

            done();
        }));
    });

    // Watchify fires update events when files change, this tells the processor
    // to remove the changed files from its cache so they will be re-processed
    browserify.on("update", function(files) {
        processor.remove(files);
    });
    
    browserify.on("bundle", function(bundler) {
        // We will recreate all bundle definitions
        bundles = {};

        bundler.on("end", function() {
            var bundling = Object.keys(bundles).length > 0,
                common;

            if(options.json) {
                fs.writeFileSync(options.json, JSON.stringify(map(processor.files, function(file) {
                    return file.compositions;
                })));
            }
            
            if(!options.css) {
                return;
            }
            
            common = processor.dependencies();
            
            if(bundling) {
                // Write out each bundle's CSS files (if they have any)
                each(bundles, function(files, bundle) {
                    var dest;
                    
                    if(!files.length && !options.empty) {
                        return;
                    }

                    // This file was part of a bundle, so remove from the common file
                    files.forEach(function(file) {
                        common.splice(common.indexOf(file), 1);
                    });

                    dest = path.join(
                        path.dirname(options.css),
                        path.basename(bundle).replace(path.extname(bundle), options.ext)
                    );
                    
                    fs.writeFileSync(dest, processor.css({
                        files : files,
                        to    : dest
                    }));
                });
                
                // No common CSS files to write out, so don't (unless they asked nicely)
                if(!common.length && !options.empty) {
                    return;
                }
            }
            
            // Write out common/all css depending on bundling status
            fs.writeFileSync(options.css, processor.css({
                files : bundling && common,
                to    : options.css
            }));
        });
    });
};
