"use strict";

var path   = require("path"),
    assert = require("assert"),
    
    Processor = require("../src/processor");

describe("/issues", function() {
    describe("/24", function() {
        it("should be able to compose using a value", function() {
            var processor = new Processor();
            
            return processor.string(
                "./test/specimens/composition.css",
                "@value simple: \"./simple.css\";\n" +
                ".wooga { composes: wooga from simple; background: #000; }"
            )
            .then(function(result) {
                var file = result.files[path.resolve("./test/specimens/composition.css")];
                
                assert.equal(
                    file.processed.root.toResult().css,
                    ".mc29d531c6_wooga { background: #000; }"
                );

                assert.deepEqual(file.exports, {
                    wooga : [
                        "mc08e91a5b_wooga",
                        "mc29d531c6_wooga"
                    ]
                });
            });
        });
    });
});
