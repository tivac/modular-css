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
                            a : {
                                value  : "red",
                                source : {}
                            },

                            b : {
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
                () => process(`@value a from "./no.css";`).css
            )
            .toThrow(/Unknown composition source/);
        });

        it("should fail if non-existent imports are referenced", function() {
            expect(
                () => process(`@value c from "./local.css";`).css
            )
            .toThrow(/Invalid @value reference: c/);
        });

        it("should ignore other @value types", function() {
            expect(
                process(`@value * as a from "./local.css"; @value b: red;`).css
            )
            .toMatchSnapshot();
        });

        it("should support importing a value from another file", function() {
            expect(
                process(`@value a from "./local.css";`).messages
            )
            .toMatchSnapshot();
        });

        it("should support importing multiple values from another file", function() {
            expect(
                process(`@value a, b from "./local.css";`).messages
            )
            .toMatchSnapshot();
        });
    });
});
