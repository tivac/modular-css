"use strict";

var assert = require("assert");

describe("modular-css", function() {
    describe("issues", function() {
        describe("issue 24", function() {
            var Processor = require("../src/processor");
            
            beforeEach(function() {
                this.processor = new Processor();
            });

            it("should be able to compose using a value", function(done) {
                this.processor.string(
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
});
