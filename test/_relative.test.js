"use strict";

var path   = require("path"),
    assert = require("assert"),
    
    relative = require("../src/_relative");

describe("/_relative.js", function() {
    it("should be a function", function() {
        assert.equal(typeof relative, "function");
    });
    
    it("should resolve files against a specified cwd", function() {
        assert.equal(
            relative(process.cwd(), path.resolve("./test/specimens/start.css")),
            "test/specimens/start.css"
        );
        
        assert.equal(
            relative(path.resolve("./test"), path.resolve("./test/specimens/start.css")),
            "specimens/start.css"
        );
    });
});

