"use strict";

var path   = require("path"),

    webpack = require("webpack"),

    Plugin  = require("../plugin.js"),
    
    use  = require.resolve("../loader.js"),
    test = /\.css$/;

describe("/issues", function() {
    describe("/248", function() {
        afterAll(() => require("shelljs").rm("-rf", "./packages/webpack/test/output/*"));

        it("should output css to disk", function(done) {
            webpack({
                entry  : "./packages/webpack/test/specimens/issues/248/index.js",
                output : {
                    path     : path.resolve("./packages/webpack/test/output"),
                    filename : "./issue-248.js"
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
                        css : "./issue-248.css"
                    })
                ]
            }, (err, stats) => {
                // I don't understand why err is null here?
                expect(stats.hasErrors()).toBeTruthy();

                done();
            });
        });
    });
});
