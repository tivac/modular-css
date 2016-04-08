"use strict";

var path   = require("path"),
    assert = require("assert"),
    
    Processor = require("../src/processor");

describe("/issues", function() {
    describe("/105", function() {
        it("should be able to compose using a symlink", function(done) {
            var processor = new Processor();
            
            processor.file("./test/specimens/issues/105/1.css").then(
                function(result) {
                    var one = result.files[path.resolve("./test/specimens/issues/105/1.css")];
                    
                    assert.deepEqual(one.compositions, {
                        wooga : [
                            "mc42c563eb_fooga",
                            "mc89b4df98_wooga"
                        ]
                    });
                    
                    assert.deepEqual(result.exports, {
                        wooga : "mc42c563eb_fooga mc89b4df98_wooga"
                    });

                    done();
                },
                
                function(error) {
                    return new Error(error);
                }
            );
        });
    });
});
