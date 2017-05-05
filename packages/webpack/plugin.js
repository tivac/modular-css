"use strict";

var sources   = require("webpack-sources"),
    Processor = require("modular-css-core");

function ModularCSS(args) {
    var options = Object.assign(
            Object.create(null),
            args
        );

    this.options = options;
}

ModularCSS.prototype.apply = function(compiler) {
    var processor;
    
    compiler.plugin("emit", (compilation, done) => {
        processor.output().then((data) => {
            if(this.options.css) {
                compilation.assets[this.options.css] = new sources.RawSource(data.css);
            }
            
            if(this.options.json) {
                compilation.assets[this.options.json] = new sources.RawSource(
                    JSON.stringify(data.compositions, null, 4)
                );
            }

            processor = null;

            done();
        });
    });
    
    compiler.plugin("this-compilation", (compilation) => {
        // Avoid caching issues by dumping the entire processor instance on each run
        processor = new Processor(this.options);
        
        // Make our processor instance available to the loader
        compilation.options.processor = processor;
    });
};

module.exports = ModularCSS;
