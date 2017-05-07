"use strict";

var sources   = require("webpack-sources"),
    Processor = require("modular-css-core");

function getChangedFiles(prev, timestamps) {
    var changedFiles,
        removedFiles;

    changedFiles = Object.keys(timestamps)
        .filter((file) => !prev[file] || prev[file] < timestamps[file]);
    removedFiles = Object.keys(prev)
        .filter((file) => !timestamps[file]);

    return changedFiles.concat(removedFiles);
}

function ModularCSS(args) {
    var options = Object.assign(
            Object.create(null),
            args
        );

    this.prevTimestamps = {};
    this.processor = new Processor(options);
    this.options = options;
}

ModularCSS.prototype.apply = function(compiler) {
    compiler.plugin("this-compilation", (compilation) => {
        var changedFiles = getChangedFiles(this.prevTimestamps, compilation.fileTimestamps);

        this.prevTimestamps = compilation.fileTimestamps;
        this.processor.remove(changedFiles);
        // Make our processor instance available to the loader
        compilation.options.processor = this.processor;
    });

    compiler.plugin("emit", (compilation, done) => {
        this.processor.output().then((data) => {
            if(this.options.css) {
                compilation.assets[this.options.css] = new sources.RawSource(data.css);
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
