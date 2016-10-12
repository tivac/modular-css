"use strict";

var path   = require("path"),
    assert = require("assert"),
    
    Processor = require("../src/processor");

describe("/issues", function() {
    describe("/191", function() {
        it.only("should ignore case differences in file paths", function() {
            var processor = new Processor();
            
            return processor.file("./test/specimens/issues/191/start.css").then(function(result) {
                assert.equal(Object.keys(result.files).length, 2);
            });
        });
    });
});
