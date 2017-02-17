"use strict";

var path   = require("path"),
    assert = require("assert"),

    webpack = require("webpack"),

    Plugin  = require("../plugin.js"),
    
    use  = require.resolve("../loader.js"),
    test = /\.css$/;

describe("/issues", function() {
    describe("/248", function() {
        it("should output css to disk", function(done) {
            webpack({
                entry   : "./test/specimens/issues/248/index.js",
                output  : {
                    path : path.resolve("./test/output/webpack"),
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
                assert.equal(stats.hasErrors(), true);

                done();
            });
        });
    });
});
