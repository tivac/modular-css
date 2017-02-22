"use strict";

var assert = require("assert"),

    leading = require("dentist").dedent,
    
    Processor = require("../processor.js"),
    compare   = require("./lib/compare.js");

describe("/issues", function() {
    describe("/56", function() {
        it("should prune rules that only compose, but leave them in the exports", function() {
            var processor = new Processor();
            
            return processor.string(
                    "./test/specimens/issues/56.css",
                    leading(`
                        .booga { color: red }
                        .fooga { composes: booga }
                        .fooga:hover { color: blue }
                        .wooga { composes: booga }
                    `)
            )
            .then((result) => {
                assert.deepEqual(result.exports, {
                    booga : [ "mc13e7db14_booga" ],
                    fooga : [ "mc13e7db14_booga", "mc13e7db14_fooga" ],
                    wooga : [ "mc13e7db14_booga", "mc13e7db14_wooga" ]
                });

                return processor.output();
            })
            .then((result) => compare.stringToFile(result.css, "./test/results/issues/56.css"));
        });
    });
});
