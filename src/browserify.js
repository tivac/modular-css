"use strict";

var fs   = require("fs"),
    path = require("path"),

    through = require("through2"),
    sink    = require("sink-transform"),
    
    assign  = require("lodash.assign"),
    diff    = require("lodash.difference"),
    each    = require("lodash.foreach"),
    flatten = require("lodash.flatten"),
    map     = require("lodash.mapvalues"),
    unique  = require("lodash.uniq"),
    
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
        bundles   = {},
        found     = [];

    if(!options.ext || options.ext.charAt(0) !== ".") {
        return browserify.emit("error", "Missing or invalid \"ext\" option: " + options.ext);
    }

    browserify.transform(function(file) {
        var id;

        if(path.extname(file) !== options.ext) {
            return through();
        }
        
        id = relative(file);
        found.push(id);
        
        return sink.str(function(buffer, done) {
            var result = processor.string(file, buffer);
            
            this.push("module.exports = " + JSON.stringify(result.exports) + ";");
            
            done();
        });
    }, { global : true });

    browserify.on("factor.pipeline", function(file, pipeline) {
        var identifier = relative(file);
        
        bundles[identifier] = [];

        // Keep track of the files in each bundle so we can determine commonalities
        // Doesn't actually modify the file though, just records it
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
            var bundling = Object.keys(bundles).length > 0,
                usage, common;
            
            if(options.json) {
                fs.writeFileSync(options.json, JSON.stringify(map(processor.files, function(file) {
                    return file.compositions;
                })));
            }
            
            if(!options.css) {
                return;
            }
            
            if(bundling) {
                usage = {};

                // Some files are used in multiple bundles, so those should be
                // promoted up to the common bundle (browserify handles this for JS)
                // TODO: see if there's a way to hook into browserify's dep tracking for this
                found.forEach(function(file) {
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
                
                // Filter out all files that were just used in one bundle
                // (Or not used in any bundles, those belong in common as well)
                common = unique(flatten(
                    found.map(function(file) {
                        return usage[file] !== 1 ? processor.dependencies(file).concat(file) : [];
                    })
                ));

                // Write out each bundle's CSS files (if they have any)
                each(bundles, function(contents, bundle) {
                    var files = [],
                        dest;
                    
                    contents.forEach(function(file) {
                        files = files.concat(processor.dependencies(file), file);
                    });
                    
                    files = diff(files, common);
                    
                    if(!files.length && !options.empty) {
                        return;
                    }

                    dest = path.join(path.dirname(options.css), path.basename(bundle).replace(path.extname(bundle), options.ext));
                    
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
