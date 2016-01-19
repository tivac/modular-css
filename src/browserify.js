"use strict";

var fs   = require("fs"),
    path = require("path"),

    through = require("through2"),
    sink    = require("sink-transform"),
    mkdirp  = require("mkdirp"),
    
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
        
        bundler, bundles;

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
            var push = this.push.bind(this);
            
            processor.string(file, buffer).then(
                function(result) {
                    // Teach browserify about dependencies by injecting require() statements
                    // There is probably a cleaner way to do this :(
                    var output = processor.dependencies(identifier).map(function(short) {
                        var long = path.resolve(process.cwd(), short);
                        
                        // I hate you, path.
                        return "require(\"" + long.replace(/\\/g, "/") + "\");";
                    });
                    
                    output = output.concat("module.exports = " + JSON.stringify(result.exports, null, 4) + ";");
                    
                    push(output.join("\n"));
                    
                    done();
                },

                function(error) {
                    // Thrown from the current bundler instance, NOT the main browserify
                    // instance. This is so that watchify won't explode.
                    bundler.emit("error", error);
                    
                    push(buffer);
                    
                    done();
                }
            );
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

    browserify.on("bundle", function(current) {
        // Every call to .bundle() means we should recreate all our bundle definitions
        // (in case things have changed out from under us, like when using watchify)
        bundles = {};
        
        bundler = current;
        
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
                    
                    mkdirp.sync(path.dirname(dest));
                    
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
            
            mkdirp.sync(path.dirname(options.css));
            
            // Write out common/all css depending on bundling status
            fs.writeFileSync(options.css, processor.css({
                files : bundling && common,
                to    : options.css
            }));
        });
    });
};
