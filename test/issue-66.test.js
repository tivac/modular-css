"use strict";

var assert = require("assert"),
    
    Processor = require("../src/processor");

describe("/issues", function() {
    describe("/66", function() {
        it("should ignore remove calls for unknown files", function(done) {
            var processor = new Processor();

            processor.string("./test/specimens/a.css", ".aooga { }")
            .then(function() {
                assert.doesNotThrow(function() {
                    processor.remove("./fooga.js");
                });

                done();
            })
            .catch(done);
        });
    });
});
