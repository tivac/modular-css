"use strict";

var path   = require("path"),
    assert = require("assert"),

    webpack = require("webpack"),

    compare = require("test-utils/compare.js")(__dirname),
    namer   = require("test-utils/namer.js"),
    
    Plugin  = require("../plugin.js"),

    use  = require.resolve("../loader.js"),
    test = /\.css$/;

describe("/webpack.js", function() {
    afterAll(() => require("shelljs").rm("-rf", "./packages/webpack/test/output/*"));

    it("should be a function", function() {
        assert(typeof Plugin, "function")
    });

    it("should output css to disk", function(done) {
        webpack({
            entry   : "./packages/webpack/test/specimens/simple.js",
            output  : {
                path : path.resolve("./packages/webpack/test/output"),
                filename : "./simple.js"
            },
            module : {
                rules : [
                    {
                        test,
                        use
                    }
                ]
            },
            plugins : [
                new Plugin({
                    namer,
                    css : "./simple.css"
                })
            ]
        }, (err, stats) => {
            assert.ifError(err);
            assert.equal(stats.hasErrors(), false);

            compare.results("simple.js");
            compare.results("simple.css");

            done();
        });
    });

    it("should output json to disk", function(done) {
        webpack({
            entry   : "./packages/webpack/test/specimens/simple.js",
            output  : {
                path : path.resolve("./packages/webpack/test/output"),
                filename : "./simple.js"
            },
            module : {
                rules : [
                    {
                        test,
                        use
                    }
                ]
            },
            plugins : [
                new Plugin({
                    namer,
                    json : "./simple.json"
                })
            ]
        }, (err, stats) => {
            assert.ifError(err);
            assert.equal(stats.hasErrors(), false);

            compare.results("simple.js");
            compare.results("simple.json");

            done();
        });
    });

    it("should report errors", function(done) {
        webpack({
            entry   : "./packages/webpack/test/specimens/invalid.js",
            output  : {
                path : path.resolve("./packages/webpack/test/output"),
                filename : "./invalid.js"
            },
            module : {
                rules : [
                    {
                        test,
                        use
                    }
                ]
            },
            plugins : [
                new Plugin({
                    namer
                })
            ]
        }, (err, stats) => {
            assert.ifError(err);

            assert.equal(stats.hasErrors(), true);

            assert(stats.toJson().errors[0].indexOf("Invalid composes reference") > -1);

            done();
        });
    });

    it("should handle dependencies", function(done) {
        webpack({
            entry   : "./packages/webpack/test/specimens/start.js",
            output  : {
                path : path.resolve("./packages/webpack/test/output"),
                filename : "./start.js"
            },
            module : {
                rules : [
                    {
                        test,
                        use
                    }
                ]
            },
            plugins : [
                new Plugin({
                    namer,
                    css  : "./start.css",
                    json : "./start.json"
                })
            ]
        }, (err, stats) => {
            assert.ifError(err);
            assert.equal(stats.hasErrors(), false);

            compare.results("start.js");
            compare.results("start.css");
            compare.results("start.json");

            done();
        });
    })
});
