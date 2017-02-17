"use strict";

var assert    = require("assert"),

    leading = require("dentist").dedent,
    
    Processor = require("../src/processor.js"),
    compare   = require("./lib/compare.js");

describe("/issues", function() {
    describe("/98", function() {
        it("should prune rules that only compose, but leave them in the exports", function() {
            var processor = new Processor();
            
            return processor.string(
                "./test/specimens/issues/98.css",
                leading(`
                    .booga { color: red }
                    .fooga { composes: booga }
                    .fooga + .fooga { color: blue }
                `)
            )
            .then((result) => {
                assert.deepEqual(result.exports, {
                    booga : [ "mc2a6c9ee9_booga" ],
                    fooga : [ "mc2a6c9ee9_booga", "mc2a6c9ee9_fooga" ]
                });

                return processor.output();
            })
            .then((result) => compare.stringToFile(result.css, "./test/results/issues/98.css"));
        });
    });
});
