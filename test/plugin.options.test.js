"use strict";

var fs      = require("fs"),
    path    = require("path"),
    assert  = require("assert"),
    
    plugin = require("../src/plugin.js"),
    
    exported = require("./lib/exported.js"),
    compare  = require("./lib/compare.js"),
    warn     = require("./lib/warn.js");

function sync(css) {
    css.append({ selector : "a" });
}

function async(css) {
    return new Promise((resolve) =>
        setTimeout(() => {
            sync(css);

            resolve();
        }, 0)
    );
}

describe("/plugin.js", function() {
    describe("options", function() {
        describe("namer", function() {
            it("should use a custom naming function", function() {
                var id = path.resolve("./test/specimens/simple.css");
                    
                return plugin.process(
                    ".wooga { }",
                    {
                        from  : "./test/specimens/simple.css",
                        namer : (filename, selector) => `namer`
                    }
                )
                .then((result) => assert.equal(
                    result.css,
                    "/* test/specimens/simple.css */\n.namer {}"
                ));
            });

            it("should use a default naming function", function() {
                return plugin.process(
                    ".wooga { }",
                    {
                        from  : "./test/specimens/simple.css"
                    }
                )
                .then((result) => assert.deepEqual(
                    exported(result).exports,
                    {
                        "test/specimens/simple.css" : {
                            wooga : "mc08e91a5b_wooga"
                        }
                    }
                ));
            });
        });

        describe("map", function() {
            it("should generate source maps", function() {
                return plugin.process(
                    fs.readFileSync("./test/specimens/start.css", "utf8"),
                    {
                        from : "./test/specimens/start.css",
                        to   : "./test/output/plugin/source-map.css",
                        map  : true
                    }
                )
                .then((result) => compare.stringToFile(
                    result.css,
                    "./test/results/plugin/source-map.css"
                ));
            });
        });

        describe("lifecycle hooks", function() {
            describe("before", function() {
                it("should run sync postcss plugins before processing", function() {
                    return plugin.process(
                        "",
                        {
                            from : "test/specimens/sync-before.css",
                            before : [ sync ]
                        }
                    )
                    .then((result) => assert.equal(
                        result.css,
                        "/* test/specimens/sync-before.css */\n" +
                        "a {}"
                    ));
                });

                it("should run async postcss plugins before processing", function() {
                    return plugin.process(
                        "",
                        {
                            from : "test/specimens/async-before.css",
                            before : [ async ]
                        }
                    )
                    .then((result) => assert.equal(
                        result.css,
                        "/* test/specimens/async-before.css */\n" +
                        "a {}"
                    ));
                });
            });
            
            describe("after", function() {
                it("should use postcss-url by default", function() {
                    return plugin.process(
                        fs.readFileSync("./test/specimens/relative.css", "utf8"),
                        {
                            from : "./test/specimens/relative.css",
                            to   : "./test/output/relative.css"
                        }
                    )
                    .then((result) => compare.stringToFile(result.css, "./test/results/plugin/relative.css"));
                });
                
               it("should run sync postcss plugins after processing", function() {
                    return plugin.process(
                        ".a {}",
                        {
                            from : "test/specimens/after.css",
                            after : [ sync ]
                        }
                    )
                    .then((result) => compare.stringToFile(result.css, "./test/results/plugin/options-after.css"));
                });

                it("should run async postcss plugins after processing", function() {
                    return plugin.process(
                        ".a {}",
                        {
                            from : "test/specimens/after.css",
                            after : [ async ]
                        }
                    )
                    .then((result) => compare.stringToFile(result.css, "./test/results/plugin/options-after.css"));
                });
            });
        });
    });
});
