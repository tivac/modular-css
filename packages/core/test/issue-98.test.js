"use strict";

var leading = require("dentist").dedent,
    
    compare = require("test-utils/compare.js")(__dirname),
    namer   = require("test-utils/namer.js"),
    
    Processor = require("../processor.js");

describe("/issues", function() {
    describe("/98", function() {
        it("should prune rules that only compose, but leave them in the exports", function() {
            var processor = new Processor({
                    namer
                });
            
            return processor.string(
                "./packages/core/test/specimens/issues/98.css",
                leading(`
                    .booga { color: red }
                    .fooga { composes: booga }
                    .fooga + .fooga { color: blue }
                `)
            )
            .then((result) => {
                expect(result.exports).toEqual({
                    booga : [ "booga" ],
                    fooga : [ "booga", "fooga" ]
                });

                return processor.output();
            })
            .then((result) => compare.stringToFile(result.css, "./packages/core/test/results/issues/98.css"));
        });
    });
});
