"use strict";

var path   = require("path"),
    assert = require("assert"),
    
    relative = require("../src/lib/relative");

describe("/lib", function() {
    describe("/relative.js", function() {
        it("should be a function", function() {
            assert.equal(typeof relative, "function");
        });

        it(`should export a "prefixed" property`, function() {
            assert.equal(typeof relative.prefixed, "function");
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

        it("should resolve files against a specified cwd w/ prefixes", function() {
            assert.equal(
                relative.prefixed(process.cwd(), path.resolve("./test/specimens/start.css")),
                "./test/specimens/start.css"
            );
            
            assert.equal(
                relative.prefixed(path.resolve("./test/specimens/"), path.resolve("./test/lib.relative.test.js")),
                "../lib.relative.test.js"
            );
        });
    });
});
