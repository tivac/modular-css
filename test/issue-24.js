"use strict";

var assert    = require("assert"),
    Processor = require("../src/processor");

describe("modular-css", function() {
    describe("issue 24", function() {
        it("should be able to compose using a value", function(done) {
            var processor = new Processor();
            
            processor.string(
                    "./test/specimens/composition.css",
                    "@value simple: \"./simple.css\";\n" +
                    ".wooga { composes: wooga from simple; background: #000; }"
            )
            .then(function(result) {
                var file = result.files["test/specimens/composition.css"];

                assert.equal(
                    file.after.root.toResult().css,
                    ".mc29d531c6_wooga { background: #000; }"
                );

                assert.deepEqual(file.compositions, {
                    wooga : [
                        "mc08e91a5b_wooga",
                        "mc29d531c6_wooga"
                    ]
                });

                done();
            })
            .catch(done);
        });
    });
});
