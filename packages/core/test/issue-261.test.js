"use strict";

var assert    = require("assert"),

    leading = require("dentist").dedent,
    
    Processor = require("../processor.js"),
    compare   = require("./lib/compare.js");

describe("/issues", function() {
    describe("/261", function() {
        it("should allow colons in rules also use :external()", function() {
            var processor = new Processor();
            
            return processor.file("./test/specimens/issues/261/2.css")
            .then((result) => processor.output())
            .then((result) => compare.stringToFile(result.css, "./test/results/issues/261.css"));
        });
    });
});
