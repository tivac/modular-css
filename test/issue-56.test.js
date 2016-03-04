"use strict";

var assert    = require("assert"),
    Processor = require("../src/processor");

describe("/issues", function() {
    describe("/56", function() {
        it("shouldn't prune classes that have pseudo-classed variants", function(done) {
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
                    booga : "mc13e7db14_booga",
                    fooga : "mc13e7db14_booga mc13e7db14_fooga",
                    wooga : "mc13e7db14_booga"
                });

                done();
            })
            .catch(done);
        });
    });
});
