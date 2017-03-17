"use strict";

var path   = require("path"),

    webpack = require("webpack"),

    read  = require("test-utils/read.js")(__dirname),
    namer = require("test-utils/namer.js"),
    
    Plugin  = require("../plugin.js"),

    use  = require.resolve("../loader.js"),
    test = /\.css$/;

describe("/webpack.js", function() {
    var output = path.resolve(__dirname, "./output");
    
    afterAll(() => require("shelljs").rm("-rf", "./packages/webpack/test/output/*"));

    it("should be a function", function() {
        expect(typeof Plugin).toBe("function");
    });

    it("should output css to disk", function(done) {
        webpack({
            entry  : "./packages/webpack/test/specimens/simple.js",
            output : {
                path     : output,
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
            expect(err).toBeFalsy();
            expect(stats.hasErrors()).toBeFalsy();

            expect(read("simple.js")).toMatchSnapshot();
            expect(read("simple.css")).toMatchSnapshot();

            done();
        });
    });

    it("should output json to disk", function(done) {
        webpack({
            entry  : "./packages/webpack/test/specimens/simple.js",
            output : {
                path     : output,
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
            expect(err).toBeFalsy();
            expect(stats.hasErrors()).toBeFalsy();

            expect(read("simple.js")).toMatchSnapshot();
            expect(read("simple.json")).toMatchSnapshot();

            done();
        });
    });

    it("should report errors", function(done) {
        webpack({
            entry  : "./packages/webpack/test/specimens/invalid.js",
            output : {
                path     : output,
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
            // Why is err not truthy?
            expect(err).toBeFalsy();
            
            expect(stats.hasErrors()).toBeTruthy();

            expect(stats.toJson().errors[0]).toMatch("Invalid composes reference");

            done();
        });
    });

    it("should handle dependencies", function(done) {
        webpack({
            entry  : "./packages/webpack/test/specimens/start.js",
            output : {
                path     : output,
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
            expect(err).toBeFalsy();
            expect(stats.hasErrors()).toBeFalsy();

            expect(read("start.js")).toMatchSnapshot();
            expect(read("start.css")).toMatchSnapshot();
            expect(read("start.json")).toMatchSnapshot();

            done();
        });
    });
});
