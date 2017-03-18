"use strict";

var path   = require("path"),
    
    plugin  = require("../plugins/values-composed.js"),
    resolve = require("../lib/resolve.js").resolve,
    
    processor = require("postcss")([ plugin ]);

describe("/plugins", function() {
    describe("/values-composed.js", function() {
        // Helper to create environment where other files are already processed
        function process(css) {
            return processor.process(css, {
                resolve,
                
                from  : path.resolve("./packages/core/test/specimens/start.css"),
                files : {
                    // Composition source
                    [path.resolve("./packages/core/test/specimens/start.css")] : {},

                    // Composition target
                    [path.resolve("./packages/core/test/specimens/local.css")] : {
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
            expect(
                () => process(`@value red from "./local.css`).css
            )
            .toThrow(/: Unclosed string/);
            
            expect(
                () => process(`@value blue from `).css
            )
            .toThrow(/SyntaxError: Expected source/);
        });

        it("should fail if importing from a file that doesn't exist", function() {
            expect(
                () => process(`@value booga from "./no.css";`).css
            )
            .toThrow(/Unknown composition source/);
        });

        it("should fail if non-existant imports are referenced", function() {
            expect(
                () => process(`@value booga from "./local.css";`).css
            )
            .toThrow(/Invalid @value reference: booga/);
            
            expect(
                () => process(`@value tooga from "./local.css";`).css
            )
            .toThrow(/Invalid @value reference: tooga/);
        });

        it("should ignore other @value types", function() {
            expect(
                process(`@value * as fooga from "./local.css"; @value tooga: red;`).css
            )
            .toMatchSnapshot();
        });

        it("should support importing a value from another file", function() {
            expect(
                process(`@value fooga from "./local.css";`).messages
            )
            .toMatchSnapshot();
        });

        it("should support importing multiple values from another file", function() {
            expect(
                process(`@value googa, fooga from "./local.css";`).messages
            )
            .toMatchSnapshot();
        });
    });
});
