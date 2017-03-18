"use strict";

var Processor = require("../processor.js"),
    output    = require("../lib/output.js");

function compositions(css) {
    var processor = new Processor();
    
    return processor.string(
        "./simple.css",
        css
    )
    .then(() => output.compositions(process.cwd(), processor));
}

describe("/lib", function() {
    describe("/output.js", function() {
        describe(".compositions()", function() {
            it("should be a function", function() {
                expect(typeof output.compositions).toBe("function");
            });
            
            it("should output an object containing compositions", function() {
                return compositions(
                    ".a { }"
                )
                .then((result) => expect(result).toMatchSnapshot());
            });
            
            it("should output an object containing compositions for multiple classes", function() {
                return compositions(
                    ".a .b { }"
                )
                .then((result) => expect(result).toMatchSnapshot());
            });
            
            it("should output an object containing compositions for inheritance", function() {
                return compositions(
                    ".a { } .b { composes: a; }"
                )
                .then((result) => expect(result).toMatchSnapshot());
            });
        });
    });
});
