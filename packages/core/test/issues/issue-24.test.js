"use strict";

var dedent = require("dedent"),
    namer  = require("test-utils/namer.js"),

    Processor = require("../../processor.js");

describe("/issues", function() {
    describe("/24", function() {
        it("should be able to compose using a value", function() {
            var processor = new Processor({
                    namer
                });
            
            return processor.string(
                "./packages/core/test/specimens/composition.css",
                dedent(`
                    @value simple: "./simple.css";
                    
                    .a {
                        composes: wooga from simple;
                        background: #000;
                    }
                `)
            )
            .then((result) => {
                expect(result.exports).toMatchSnapshot();

                return processor.output();
            })
            .then((result) => expect(result.css).toMatchSnapshot());
        });
    });
});
