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
            ext : ".css"
        }, opts || {}),
        
        processor = new Processor(options),
        
        bundler, bundles, handled;

    if(!options.ext || options.ext.charAt(0) !== ".") {
        return browserify.emit("error", "Missing or invalid \"ext\" option: " + options.ext);
    }

    browserify.transform(function(file) {
        if(path.extname(file) !== options.ext) {
            return through();
        }
        
        return sink.str(function(buffer, done) {
            var push = this.push.bind(this);
            
            processor.string(file, buffer).then(
                function(result) {
                    // Tell watchers about dependencies by emitting "file" events
                    // AFAIK this is only useful to watchify, to ensure that it watches
                    // everyone in the dependency graph
                    processor.dependencies(result.id).forEach(function(id) {
                        browserify.emit("file", path.resolve(process.cwd(), id), id);
                    });
                    
                    push("module.exports = " + JSON.stringify(result.exports, null, 4) + ";");
                    
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
    
    // Splice ourselves as early as possible into the deps pipeline
    browserify.pipeline.get("deps").splice(1, 0, through.obj(function(row, enc, done) {
        // Ensure that browserify knows about the CSS dependency tree by updating
        // any referenced entries w/ their dependencies
        var id;
        
        if(path.extname(row.file) !== options.ext) {
            return done(null, row);
        }
        
        id = relative(row.file);
        
        handled.push(id);
        
        row.deps = processor.dependencies(id).reduce(function(curr, next) {
            curr["./" + next] = path.resolve(next);
            
            return curr;
        }, {});
        
        done(null, row);
    }, function(done) {
        // Ensure that any CSS dependencies not directly referenced are
        // injected into the stream of files being managed
        var push = this.push.bind(this);
        
        processor.dependencies().forEach(function(short) {
            var id;
                
            if(handled.indexOf(short) > -1) {
                return;
            }
            
            id = path.resolve(short);
            
            push({
                id     : id,
                file   : id,
                source : "module.exports = " + JSON.stringify(processor.files[short].exports, null, 4) + ";",
                deps   : processor.dependencies(short).reduce(function(curr, next) {
                    curr["./" + next] = path.resolve(next);
                    
                    return curr;
                }, {})
            });
        });
        
        done();
    }));
    
    // Keep tabs on factor-bundle organization
    browserify.on("factor.pipeline", function(file, pipeline) {
        var identifier = relative(file);
        
        bundles[identifier] = [];

        // Track the files in each bundle so we can determine commonalities
        // Doesn't actually modify the file, just records it
        pipeline.unshift(through.obj(function(obj, enc, done) {
            var child;
            
            if(path.extname(obj.file) === options.ext) {
                child = relative(obj.file);
                
                bundles[identifier].unshift(child);
            }

            done(null, obj);
        }));
    });

    // Watchify fires update events when files change, this tells the processor
    // to remove the changed files from its cache so they will be re-processed
    browserify.on("update", function(files) {
        processor.remove(files);
    });
    
    browserify.on("bundle", function(current) {
        // Calls to .bundle() means we should recreate anything tracking bundling progress
        // in case things have changed out from under us, like when using watchify
        bundles = {};
        handled = [];
        
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
                        path.basename(bundle, path.extname(bundle)) + options.ext
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
