"use strict";

var path   = require("path"),
    assert = require("assert"),

    webpack = require("webpack"),

    loader  = require("../src/webpack.js"),
    compare = require("./lib/compare-files.js");

describe.only("/webpack.js", function() {
    it("should be a function", function() {
        assert(typeof loader, "function")
    });

    it("should do something", function(done) {
        webpack({
            entry   : "./test/specimens/simple.js",
            output  : {
                path : path.resolve("./test/results/webpack"),
                filename : "./simple.js"
            },
            module : {
                rules : [
                    {
                        test   : /\.css$/,
                        loader : "css-loader" //path.resolve("./src/webpack.js")
                    }
                ]
            }
        }, (err, stats) => {
            assert.ifError(err);

            done();
        });
    });
});
