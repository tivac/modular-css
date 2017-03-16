"use strict";

var assert = require("assert"),

    Processor = require("../processor.js"),
    output   = require("../lib/output.js");

function compositions(css) {
    var processor = new Processor();
    
    return processor.string("./packages/core/test/specimens/simple.css", css).then(function() {
        var out = output.compositions(process.cwd(), processor);
        
        return out;
    });
}

describe("/lib", function() {
    describe("/output.js", function() {
        describe(".compositions()", function() {
            it("should be a function", function() {
                assert(typeof output.compositions === "function");
            });
            
            it("should output an object containing compositions", function() {
                return compositions(
                    ".wooga { }"
                )
                .then((out) => {
                    assert(typeof out === "object");
                    
                    expect(out, {
                        "packages/core/test/specimens/simple.css" : {
                            wooga : "wooga"
                        }
                    });
                });
            });
            
            it("should output an object containing compositions for multiple classes", function() {
                return compositions(
                    ".wooga .booga { }"
                )
                .then(function(out) {
                    expect(out, {
                        "packages/core/test/specimens/simple.css" : {
                            booga : "booga",
                            wooga : "wooga"
                        }
                    });
                });
            });
            
            it("should output an object containing compositions for inheritance", function() {
                return compositions(
                    ".wooga { } .booga { composes: wooga; }"
                )
                .then(function(out) {
                    expect(out, {
                        "packages/core/test/specimens/simple.css" : {
                            booga : "wooga booga",
                            wooga : "wooga"
                        }
                    });
                });
            });
        });
    });
});
