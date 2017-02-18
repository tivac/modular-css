"use strict";

var sources   = require("webpack-sources"),
    Processor = require("modular-css-core");

function Webpack(args) {
    var options = Object.assign(
            Object.create(null),
            args
        );

    this.processor = new Processor(options);
    this.options   = options;
}

Webpack.prototype.apply = function(compiler) {
    compiler.plugin("emit", (compilation, done) => {
        this.processor.output().then((data) => {
            if(this.options.css) {
                compilation.assets[this.options.css] = new sources.RawSource(data.css);
            }
            
            if(this.options.json) {
                compilation.assets[this.options.json] = new sources.RawSource(JSON.stringify(data.compositions, null, 4));
            }

            done();
        });
    });
    
    compiler.plugin("this-compilation", (compilation) => {
        // Make our processor instance available to the loader
        compilation.options.processor = this.processor;
    });
};

module.exports = Webpack;
