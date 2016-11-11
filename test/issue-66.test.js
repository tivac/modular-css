"use strict";

var assert = require("assert"),
    
    Processor = require("../src/processor");

describe("/issues", function() {
    describe("/66", function() {
        it("should ignore remove calls for unknown files", function() {
            var processor = new Processor();

            return processor.string(
                "./test/specimens/a.css",
                ".aooga { }"
            )
            .then(() => assert.doesNotThrow(function() {
                processor.remove("./fooga.js");
            }));
        });
    });
});
