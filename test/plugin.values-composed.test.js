"use strict";

var path   = require("path"),
    assert = require("assert"),
    
    plugin  = require("../src/plugins/values-composed.js"),
    message = require("../src/lib/message.js"),
    
    processor = require("./lib/postcss.js")([ plugin ]);

describe("/plugins", function() {
    describe("/values-composed.js", function() {
        // Helper to create environment where other files are already processed
        function process(css) {
            return processor.process(css, {
                from  : path.resolve("./test/specimens/start.css"),
                files : {
                    // Composition source
                    [ path.resolve("./test/specimens/start.css") ] : {},

                    // Composition target
                    [ path.resolve("./test/specimens/local.css") ] : {
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
            assert.throws(
                () => process(`@value red from "./local.css`).css,
                /: Unclosed string/
            );
            
            assert.throws(
                () => process(`@value blue from `).css,
                /SyntaxError: Expected source/
            );
        });

        it("should fail if importing from a file that doesn't exist", function() {
            assert.throws(
                () => process(`@value booga from "./no.css";`).css,
                /Unknown composition source/
            );
        });

        it("should fail if non-existant imports are referenced", function() {
            assert.throws(
                () => process(`@value booga from "./local.css";`).css,
                /Invalid @value reference: booga/
            );
            
            assert.throws(
                () => process(`@value tooga from "./local.css";`).css,
                /Invalid @value reference: tooga/
            );
        });

        it("should ignore other @value types", function() {
            assert.equal(
                process(`@value * as fooga from "./local.css"; @value tooga: red;`).css,
                `@value * as fooga from "./local.css"; @value tooga: red;`
            );
        });

        it("should support importing a value from another file", function() {
            var result = process(`@value fooga from "./local.css";`);
                
            assert.deepEqual(
                message(result, "values"),
                {
                    fooga : {
                        value  : "red",
                        source : {}
                    }
                }
            );
        });

        it("should support importing multiple values from another file", function() {
            var result = process(`@value googa, fooga from "./local.css";`);
            
            assert.deepEqual(
                message(result, "values"),
                {
                    fooga : {
                        value  : "red",
                        source : {}
                    },

                    googa : {
                        value  : "blue",
                        source : {}
                    }
                }
            );
        });
    });
});
