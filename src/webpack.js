"use strict";

var fs   = require("fs"),
    path = require("path"),
    
    mkdirp  = require("mkdirp"),
    
    Processor = require("./processor");

function Webpack(args) {
    var options = Object.assign(
            Object.create(null),
            args
        );

    this.processor = new Processor(options);
    this.options   = options;
}

Webpack.prototype.apply = function(compiler) {
    compiler.plugin("this-compilation", (compilation) => {
        compilation.plugin("additional-assets", (callback) => {
            this.processor.output().then((data) => {
                if(this.options.css) {
                    mkdirp.sync(path.dirname(this.options.css));
                    fs.writeFileSync(
                        this.options.css,
                        data.css
                    );
                }
                
                if(this.options.json) {
                    mkdirp.sync(path.dirname(this.options.json));
                    fs.writeFileSync(
                        this.options.json,
                        JSON.stringify(data.compositions, null, 4)
                    );
                }

                callback();
            });
        });
    });
};

Webpack.prototype.rule = function(args) {
    return Object.assign(
        {},
        args,
        {
            loader  : require.resolve("./webpack-loader.js"),
            options : {
                processor : this.processor
            }
        }
    );
};

module.exports = Webpack;
