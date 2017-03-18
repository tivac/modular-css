"use strict";

var path = require("path"),
    
    plugin  = require("../plugins/values-namespaced.js"),
    resolve = require("../lib/resolve.js").resolve,

    processor = require("postcss")([ plugin ]);

describe("/plugins", function() {
    describe("/values-namespaced.js", function() {
        // Helper to create environment where other files are already processed
        function process(css) {
            return processor.process(css, {
                resolve,
                
                from  : path.resolve("./packages/core/test/specimens/start.css"),
                files : {
                    // Composition source
                    [path.resolve("./packages/core/test/specimens/start.css")] : {},

                    // Composition targets
                    [path.resolve("./packages/core/test/specimens/empty.css")] : {},
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
                () => process(`@value * as fooga from "./local.css`).css
            )
            .toThrow(/: Unclosed string/);
            
            expect(
                () => process(`@value * as fooga`).css
            )
            .toThrow(/SyntaxError: Expected "from"/);
        });

        it("should fail if importing from a file that doesn't exist", function() {
            expect(
                () => process(`@value * as booga from "./no.css";`).css
            )
            .toThrow(/Unknown composition source/);
        });

        it("should fail if importing a file w/ no exports", function() {
            expect(
                () => process(`@value * as booga from "./empty.css";`).css
            )
            .toThrow(/Unknown composition source/);
        });

        it("should ignore other @value types", function() {
            expect(
                process(`@value fooga from "./local.css"; @value tooga: red;`).css
            )
            .toMatchSnapshot();
        });

        it("should support importing a value from another file", function() {
            expect(
                process(`@value * as ns from "./local.css";`).messages
            )
            .toMatchSnapshot();
        });
    });
});
