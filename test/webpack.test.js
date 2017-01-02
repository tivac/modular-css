"use strict";

var path   = require("path"),
    assert = require("assert"),

    webpack = require("webpack"),

    Plugin  = require("../src/webpack.js"),
    compare = require("./lib/compare.js");

describe("/webpack.js", function() {
    after(() => require("shelljs").rm("-rf", "./test/output/webpack"));

    it("should be a function", function() {
        assert(typeof Plugin, "function")
    });

    it("should output css to disk", function(done) {
        var plugin = new Plugin({
                css : "./test/output/webpack/simple.css"
            });

        webpack({
            entry   : "./test/specimens/simple.js",
            output  : {
                path : path.resolve("./test/output/webpack"),
                filename : "./simple.js"
            },
            module : {
                rules : [
                    plugin.rule({
                        test : /\.css$/
                    })
                ]
            },
            plugins : [
                plugin
            ]
        }, (err, stats) => {
            assert.ifError(err);
            assert.equal(stats.hasErrors(), false);

            compare.results("webpack/simple.js");
            compare.results("webpack/simple.css");

            done();
        });
    });

    it("should output json to disk", function(done) {
        var plugin = new Plugin({
                json : "./test/output/webpack/simple.json"
            });

        webpack({
            entry   : "./test/specimens/simple.js",
            output  : {
                path : path.resolve("./test/output/webpack"),
                filename : "./simple.js"
            },
            module : {
                rules : [
                    plugin.rule({
                        test : /\.css$/
                    })
                ]
            },
            plugins : [
                plugin
            ]
        }, (err, stats) => {
            assert.ifError(err);
            assert.equal(stats.hasErrors(), false);

            compare.results("webpack/simple.js");
            compare.results("webpack/simple.json");

            done();
        });
    });

    it("should report errors", function(done) {
        var plugin = new Plugin();

        webpack({
            entry   : "./test/specimens/invalid.js",
            output  : {
                path : path.resolve("./test/output/webpack"),
                filename : "./invalid.js"
            },
            module : {
                rules : [
                    plugin.rule({
                        test : /\.css$/
                    })
                ]
            },
            plugins : [
                plugin
            ]
        }, (err, stats) => {
            assert.ifError(err);

            assert.equal(stats.hasErrors(), true);

            assert(stats.toJson().errors[0].indexOf("Invalid composes reference") > -1);

            done();
        });
    });

    it("should handle dependencies", function(done) {
        var plugin = new Plugin({
                css  : "./test/output/webpack/start.css",
                json : "./test/output/webpack/start.json"
            });

        webpack({
            entry   : "./test/specimens/start.js",
            output  : {
                path : path.resolve("./test/output/webpack"),
                filename : "./start.js"
            },
            module : {
                rules : [
                    plugin.rule({
                        test : /\.css$/
                    })
                ]
            },
            plugins : [
                plugin
            ]
        }, (err, stats) => {
            assert.ifError(err);
            assert.equal(stats.hasErrors(), false);

            compare.results("webpack/start.js");
            compare.results("webpack/start.css");
            compare.results("webpack/start.json");

            done();
        });
    })
});
