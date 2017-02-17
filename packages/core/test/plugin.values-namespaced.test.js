"use strict";

var path   = require("path"),
    assert = require("assert"),
    
    plugin  = require("..//plugins/values-namespaced.js"),
    resolve = require("..//lib/resolve.js"),

    processor = require("postcss")([ plugin ]);

describe("/plugins", function() {
    describe("/values-namespaced.js", function() {
        // Helper to create environment where other files are already processed
        function process(css) {
            return processor.process(css, {
                resolve,
                
                from  : path.resolve("./test/specimens/start.css"),
                files : {
                    // Composition source
                    [path.resolve("./test/specimens/start.css")] : {},

                    // Composition targets
                    [path.resolve("./test/specimens/empty.css")] : {},
                    [path.resolve("./test/specimens/local.css")] : {
                        values : {
                            fooga : {
                                value  : "red",
                                source : {}
                            },

                            googa : {
                                value  : "blue",
                                source : {}
                            }
                        }
                    }
                }
            });
        }
        
        it("should fail to parse invalid declarations", function() {
            assert.throws(() => process(`@value * as fooga from "./local.css`).css, /: Unclosed string/);
            assert.throws(() => process(`@value * as fooga`).css, /SyntaxError: Expected "from"/);
        });

        it("should fail if importing from a file that doesn't exist", function() {
            assert.throws(function() {
                process(`@value * as booga from "./no.css";`).css;
            }, /Unknown composition source/);
        });

        it("should fail if importing a file w/ no exports", function() {
            assert.throws(function() {
                process(`@value * as booga from "./empty.css";`).css;
            }, /Unknown composition source/);
        });

        it("should ignore other @value types", function() {
            assert.equal(
                process(`@value fooga from "./local.css"; @value tooga: red;`).css,
                `@value fooga from "./local.css"; @value tooga: red;`
            );
        });

        it("should support importing a value from another file", function() {
            assert.deepEqual(
                process(`@value * as ns from "./local.css";`).messages,
                [{
                    type   : "modular-css",
                    plugin : "modular-css-values-namespaced",
                    values : {
                        ns : {
                            fooga : {
                                value  : "red",
                                source : {}
                            },

                            googa : {
                                value  : "blue",
                                source : {}
                            }
                        }
                    }
                }]
            );
        });
    });
});
