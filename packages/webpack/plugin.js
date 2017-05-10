"use strict";

var sources   = require("webpack-sources"),
    Processor = require("modular-css-core");

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

    this.prev = {};
    this.processor = new Processor(options);
    this.options = options;
}

ModularCSS.prototype.apply = function(compiler) {
    compiler.plugin("this-compilation", (compilation) => {
        var files = getChangedFiles(this.prev, compilation.fileTimestamps);

        // Remove changed/removed files from processor instance
        this.processor.remove(files);
        
        this.prev = compilation.fileTimestamps;

        // Make processor instance available to the loader
        compilation.options.processor = this.processor;
    });

    compiler.plugin("emit", (compilation, done) => {
        this.processor.output().then((data) => {
            if(this.options.css) {
                compilation.assets[this.options.css] = new sources.RawSource(
                    data.css
                );
            }
            
            if(this.options.json) {
                compilation.assets[this.options.json] = new sources.RawSource(
                    JSON.stringify(data.compositions, null, 4)
                );
            }

            done();
        });
    });
};

module.exports = ModularCSS;
