"use strict";

var assert = require("assert"),

    namer = require("../");

describe("modular-css-namer", function() {
    var fn;
    
    beforeEach(() => (fn = namer()));
    
    it("should hash its arguments", function() {
        assert.equal(fn("./fooga", ".fooga"), "AA");
    });
    
    it("should differ within files", function() {
        var one = fn("./fooga", ".fooga"),
            two = fn("./fooga", ".booga");
        
        assert.equal(one, "AA");
        assert.equal(two, "AB");
    });
    
    it("should re-use selectors for identical inputs", function() {
        var one = fn("./fooga", ".fooga"),
            two = fn("./fooga", ".fooga");
        
        assert.equal(one, "AA");
        assert.equal(two, "AA");
    });

    it("should differ between files", function() {
        assert.equal(fn("./fooga", ".fooga"), "AA");
        assert.equal(fn("./booga", ".fooga"), "BA");
    });
    
    it("should wrap as necessary", function() {
        var x, y;
        
        for(x = 0; x < 100; x++) {
            for(y = 0; y < 100; y++) {
                fn("./fooga" + x, ".fooga" + y);
            }
        }
        
        assert.equal(fn("./fooga" + 15, ".fooga" + 5), "PF");
        assert.equal(fn("./fooga" + 1, ".fooga" + 5), "BF");
        assert.equal(fn("./fooga" + 49, ".fooga" + 33), "xh");
        assert.equal(fn("./fooga" + 55, ".fooga" + 63), "zD9B");
        assert.equal(fn("./fooga" + 26, ".fooga" + 0), "aA");
    });
});
