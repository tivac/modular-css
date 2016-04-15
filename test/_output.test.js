"use strict";

var assert = require("assert"),

    Processor = require("../src/processor"),
    output   = require("../src/_output.js");

function compositions(css) {
    var processor = new Processor();
    
    return processor.string("./test/specimens/simple.css", css).then(function() {
        var out = output.compositions(process.cwd(), processor);
        
        return out;
    });
}

describe("/_output.js", function() {
    describe(".compositions()", function() {
        it("should be a function", function() {
            assert(typeof output.compositions === "function");
        });
        
        it("should output an object containing compositions", function() {
            return compositions(".wooga { }").then(function(out) {
                assert(typeof out === "object");
                
                assert.deepEqual(out, {
                    "test/specimens/simple.css" : {
                        wooga : "mc08e91a5b_wooga"
                    }
                });
            });
        });
        
        it("should output an object containing compositions for multiple classes", function() {
            return compositions(".wooga .booga { }").then(function(out) {
                assert.deepEqual(out, {
                    "test/specimens/simple.css" : {
                        booga : "mc08e91a5b_booga",
                        wooga : "mc08e91a5b_wooga"
                    }
                });
            });
        });
        
        it("should output an object containing compositions for inheritance", function() {
            return compositions(".wooga { } .booga { composes: wooga; }").then(function(out) {
                assert.deepEqual(out, {
                    "test/specimens/simple.css" : {
                        booga : "mc08e91a5b_wooga mc08e91a5b_booga",
                        wooga : "mc08e91a5b_wooga"
                    }
                });
            });
        });
    });
});
