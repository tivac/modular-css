"use strict";

var assert = require("assert"),

    namer = require("../");

describe("modular-css-namer", function() {
    beforeEach(function() {
        this.namer = namer();
    });
    
    it("should hash its arguments", function() {
        assert.equal(this.namer("./fooga", ".fooga"), "a0");
    });
    
    it("should re-use prefixes for files w/ the same path", function() {
        var one = this.namer("./fooga", ".fooga"),
            two = this.namer("./fooga", ".booga");
        
        assert.equal(one, "a0");
        assert.equal(two, "a1");
    });
    
    it("should re-use suffixes for identical selectors", function() {
        var one = this.namer("./fooga", ".fooga"),
            two = this.namer("./booga", ".fooga");
        
        assert.equal(one, "a0");
        assert.equal(two, "b0");
    });
    
    it("should increment file counters", function() {
        assert.equal(this.namer("./fooga", ".fooga"), "a0");
        assert.equal(this.namer("./booga", ".fooga"), "b0");
    });
    
    it("should increment selector counters", function() {
        assert.equal(this.namer("./fooga", ".fooga"), "a0");
        assert.equal(this.namer("./fooga", ".booga"), "a1");
    });
    
    it("should increase the prefix as necessary", function() {
        var x, y;
        
        for(x = 0; x < 50; x++) {
            for(y = 0; y < 50; y++) {
                this.namer("./fooga" + x, ".fooga" + y);
            }
        }
        
        assert.equal(this.namer("./fooga" + 15, ".fooga" + 5), "p5");
        assert.equal(this.namer("./fooga" + 1, ".fooga" + 5), "b5");
        assert.equal(this.namer("./fooga" + 49, ".fooga" + 33), "zx33");
    });
});
