"use strict";

var sources   = require("webpack-sources"),
    Processor = require("modular-css-core"),
    ismap     = require("lodash.ismap");

// Return a list of changed/removed files based on timestamp objects
function getChangedFiles(prev, curr) {
    return Object.keys(curr)
        .filter((file) =>
            !prev[file] || prev[file] < curr[file]
        )
        .concat(
            Object.keys(prev).filter((file) => !curr[file])
        );
}

function ModularCSS(args) {
    var options = Object.assign(
            Object.create(null),
            args
        );

    if(options.cjs) {
        options.namedExports = false;
    }

    this.prev = {};
    this.processor = new Processor(options);
    this.options = options;
}

ModularCSS.prototype.apply = function(compiler) {
    var watching = false;

    // File invalidated by webpack watcher
    compiler.plugin("invalid", (file) => {
        this.processor.remove(file);
    });

    compiler.plugin("watch-run", (c, done) => {
        watching = true;

        done();
    });

    // Runs before compilation begins
    compiler.plugin("this-compilation", (compilation) => {
        var files;
        
        // Make processor instance available to the loader
        compilation.options.processor = this.processor;
        
        // This code is only useful when calling .run() multiple times
        // watching handles its own invalidations
        if(!watching) {
            let current;

            if(ismap(compilation.fileTimestamps)) {
                current = {};

                compilation.fileTimestamps.forEach((value, key) => (current[key] = value));
            }

            files = getChangedFiles(this.prev, current || compilation.fileTimestamps);

            // Remove changed/removed files from processor instance
            this.processor.remove(files);
            
            this.prev = compilation.fileTimestamps;
        }
    });

    compiler.plugin("emit", (compilation, done) =>
        this.processor.output({
            to : this.options.css || false,
        })
        .then((data) => {
            if(this.options.css) {
                compilation.assets[this.options.css] = data.map ?
                    new sources.SourceMapSource(
                        data.css,
                        this.options.css,
                        data.map
                    ) :
                    new sources.RawSource(
                        data.css
                    );
                
                // Write out external source map if it exists
                if(data.map) {
                    compilation.assets[`${this.options.css}.map`] = new sources.RawSource(
                        data.map.toString()
                    );
                }
            }
            
            if(this.options.json) {
                compilation.assets[this.options.json] = new sources.RawSource(
                    JSON.stringify(data.compositions, null, 4)
                );
            }

            return done();
        })
        .catch(done)
    );
};

module.exports = ModularCSS;
