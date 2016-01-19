"use strict";

var assert = require("assert"),

    relative = require("../src/_relative");

describe("modular-css", function() {
    describe("util-relative", function() {
        it("should export a function", function() {
            assert.equal(typeof relative, "function");
        });
        
        it("should determine a relative path", function() {
            assert.equal(relative("./test/specimens/fooga.css"), "test/specimens/fooga.css");
        });
        
        it("should always use forward slashes as path separators", function() {
            assert.equal(relative("./wooga/fooga.css"), "wooga/fooga.css");
        });
    });
});
