"use strict";

var leading = require("dentist").dedent,
    namer = require("test-utils/namer.js"),

    Processor = require("../processor.js");

describe("/issues", function() {
    describe("/24", function() {
        it("should be able to compose using a value", function() {
            var processor = new Processor({
                    namer
                });
            
            return processor.string(
                "./packages/core/test/specimens/composition.css",
                leading(`
                    @value simple: "./simple.css";
                    
                    .a {
                        composes: wooga from simple;
                        background: #000;
                    }
                `)
            )
            .then((result) => {
                expect(result.exports).toEqual({
                    a : [
                        "wooga",
                        "a"
                    ]
                });

                return processor.output();
            })
            .then((result) =>
                expect(result.css).toBe(
                    leading(`
                        /* packages/core/test/specimens/simple.css */
                        .wooga {
                            color: red
                        }
                        /* packages/core/test/specimens/composition.css */
                        .a {
                            background: #000
                        }
                    `)
                )
            );
        });
    });
});
