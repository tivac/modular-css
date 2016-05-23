"use strict";

var assert = require("assert"),
    
    Processor = require("../src/processor"),
    compare   = require("./lib/compare-files");

describe("/issues", function() {
    describe("/56", function() {
        it("should prune rules that only compose, but leave them in the exports", function(done) {
            var processor = new Processor();
            
            processor.string(
                    "./test/specimens/issues/56.css",
                    ".booga { color: red } " +
                    ".fooga { composes: booga } " +
                    ".fooga:hover { color: blue } " +
                    ".wooga { composes: booga }"
            )
            .then(function(result) {
                assert.deepEqual(result.exports, {
                    booga : [ "mc13e7db14_booga" ],
                    fooga : [ "mc13e7db14_booga", "mc13e7db14_fooga" ],
                    wooga : [ "mc13e7db14_booga", "mc13e7db14_wooga" ]
                });

                return processor.output();
            })
            .then(function(result) {
                compare.stringToFile(result.css, "./test/results/issues/56.css");
                
                done();
            })
            .catch(done);
        });
    });
});
