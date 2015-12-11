"use strict";

var assert = require("assert"),
    
    Processor = require("../src/processor");

describe("postcss-modular-css", function() {
    describe("issues", function() {
        describe("issue 24", function() {
            beforeEach(function() {
                this.processor = new Processor();
            });

            it("should be able to compose using a value", function() {
                var result = this.processor.string(
                        "./test/specimens/composition.css",
                        "@value simple: \"./simple.css\";\n" +
                        ".wooga { composes: wooga from simple; background: #000; }"
                    ),
                    file;

                file = result.files["test/specimens/composition.css"];

                assert.equal(
                    file.parsed.root.toResult().css,
                    ".mc29d531c6_wooga { background: #000; }"
                );

                assert.deepEqual(file.compositions, {
                    wooga : [
                        "mc08e91a5b_wooga",
                        "mc29d531c6_wooga"
                    ]
                });
            });
        });
    });
});
