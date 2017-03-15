"use strict";

var fs   = require("fs"),
    path = require("path"),

    through = require("through2"),
    sink    = require("sink-transform"),
    mkdirp  = require("mkdirp"),

    each    = require("lodash.foreach"),
    
    Processor = require("modular-css-core"),
    relative  = require("modular-css-core/lib/relative.js"),
    output    = require("modular-css-core/lib/output.js");

module.exports = function(browserify, opts) {
    var options = Object.assign(Object.create(null), {
            ext   : ".css",
            map   : browserify._options.debug,
            cwd   : browserify._options.basedir || process.cwd(),
            cache : true
        }, opts),
        
        processor = opts.cache && new Processor(options),
        
        bundler, bundles, handled;
    
    if(!options.ext || options.ext.charAt(0) !== ".") {
        return browserify.emit("error", "Missing or invalid \"ext\" option: " + options.ext);
    }
    
    function depReducer(curr, next) {
        curr[relative.prefixed(options.cwd, next)] = next;
        
        return curr;
    }

    browserify.transform(function(file) {
        if(path.extname(file) !== options.ext) {
            return through();
        }
        
        return sink.str(function(buffer, done) {
            var push = this.push.bind(this),
                real = fs.realpathSync(file);
            
            processor.string(real, buffer).then(
                function(result) {
                    // Tell watchers about dependencies by emitting "file" events
                    // AFAIK this is only useful to watchify, to ensure that it watches
                    // everyone in the dependency graph
                    processor.dependencies(result.id).forEach(function(id) {
                        browserify.emit("file", path.resolve(process.cwd(), id), id);
                    });
                    
                    push("module.exports = " + JSON.stringify(output.join(result.exports), null, 4) + ";");
                    
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
    });
    
    // Splice ourselves as early as possible into the deps pipeline
    browserify.pipeline.get("deps").splice(1, 0, through.obj(function(row, enc, done) {
        if(path.extname(row.file) !== options.ext) {
            return done(null, row);
        }
        
        handled[row.id] = true;
        
        // Ensure that browserify knows about the CSS dependency tree by updating
        // any referenced entries w/ their dependencies
        row.deps = processor.dependencies(row.file).reduce(depReducer, {});
        
        return done(null, row);
    }, function(done) {
        // Ensure that any CSS dependencies not directly referenced are
        // injected into the stream of files being managed
        var push = this.push.bind(this);
        
        processor.dependencies().forEach(function(dep) {
            if(dep in handled) {
                return;
            }
            
            push({
                id     : dep,
                file   : dep,
                source : "module.exports = " + JSON.stringify(output.join(processor.files[dep].exports), null, 4) + ";",
                deps   : processor.dependencies(dep).reduce(depReducer, {})
            });
        });
        
        done();
    }));
    
    // Keep tabs on factor-bundle organization
    browserify.on("factor.pipeline", function(file, pipeline) {
        bundles[file] = [];

        // Track the files in each bundle so we can determine commonalities
        // Doesn't actually modify the file, just records it
        pipeline.unshift(through.obj(function(obj, enc, done) {
            if(path.extname(obj.file) === options.ext) {
                bundles[file].unshift(obj.file);
            }

            done(null, obj);
        }));
    });

    // Watchify fires update events when files change, this tells the processor
    // to remove the changed files from its cache so they will be re-processed
    browserify.on("update", function(files) {
        processor.remove(files);
    });
    
    return browserify.on("bundle", function(current) {
        // Calls to .bundle() means we should recreate anything tracking bundling progress
        // in case things have changed out from under us, like when using watchify
        bundles = {};
        handled = {};
        
        // cache set to false means we need to create a new Processor each run-through
        if(!opts.cache) {
            processor = new Processor(options);
        }

        bundler = current;
        
        // Listen for bundling to finish
        bundler.on("end", function() {
            var bundling = Object.keys(bundles).length > 0,
                common;
            
            if(options.json) {
                mkdirp.sync(path.dirname(options.json));
                
                fs.writeFileSync(
                    options.json,
                    JSON.stringify(output.compositions(options.cwd, processor), null, 4)
                );
            }
            
            if(!options.css) {
                return;
            }
            
            common = processor.dependencies();
            
            if(bundling) {
                // Write out each bundle's CSS files (if they have any)
                each(bundles, (files, bundle) => {
                    var dest;
                    
                    if(!files.length && !options.empty) {
                        return;
                    }

                    // This file was part of a bundle, so remove from the common file
                    files.forEach((file) =>
                        common.splice(common.indexOf(file), 1)
                    );

                    dest = path.join(
                        path.dirname(options.css),
                        path.basename(bundle, path.extname(bundle)) + ".css"
                    );
                    
                    mkdirp.sync(path.dirname(dest));
                    
                    processor.output({
                        files : files,
                        to    : dest
                    })
                    .then((result) => fs.writeFileSync(dest, result.css))
                    .catch((error) => bundler.emit("error", error));
                });
                
                // No common CSS files to write out, so don't (unless they asked nicely)
                if(!common.length && !options.empty) {
                    return;
                }
            }
            
            mkdirp.sync(path.dirname(options.css));
            
            // Write out common/all css depending on bundling status
            processor.output({
                files : bundling && common,
                to    : options.css
            })
            .then((result) => fs.writeFileSync(options.css, result.css))
            .catch((error) => bundler.emit("error", error));
        });
    });
};
