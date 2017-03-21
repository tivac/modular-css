"use strict";

var dedent = require("dedent"),
    namer  = require("test-utils/namer.js"),
    
    Processor = require("../processor.js");

describe("/issues", function() {
    describe("/56", function() {
        it("should prune rules that only compose, but leave them in the exports", function() {
            var processor = new Processor({
                    namer
                });
            
            return processor.string(
                    "./packages/core/test/specimens/issues/56.css",
                    dedent(`
                        .booga { color: red }
                        .fooga { composes: booga }
                        .fooga:hover { color: blue }
                        .wooga { composes: booga }
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
