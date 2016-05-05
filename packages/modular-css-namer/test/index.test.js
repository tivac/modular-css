"use strict";

var assert = require("assert"),

    namer = require("../");

describe("modular-css-namer", function() {
    beforeEach(function() {
        this.namer = namer();
    });
    
    it("should hash its arguments", function() {
        assert.equal(this.namer("./fooga", ".fooga"), "a0_0");
    });
    
    it("should re-use prefixes for files w/ the same path", function() {
        var one = this.namer("./fooga", ".fooga"),
            two = this.namer("./fooga", ".booga");
        
        assert.equal(one.split("_")[0], two.split("_")[0]);
    });
    
    it("should re-use suffixes for identical selectors", function() {
        var one = this.namer("./fooga", ".fooga"),
            two = this.namer("./booga", ".fooga");
        
        assert.equal(one.split("_")[1], two.split("_")[1]);
    });
    
    it("should increment file counters", function() {
        assert.equal(this.namer("./fooga", ".fooga"), "a0_0");
        assert.equal(this.namer("./booga", ".fooga"), "a1_0");
    });
    
    it("should increment selector counters", function() {
        assert.equal(this.namer("./fooga", ".fooga"), "a0_0");
        assert.equal(this.namer("./fooga", ".booga"), "a0_1");
    });
    
    it("should use base 36", function() {
        var x, y;
        
        for(x = 0; x < 50; x++) {
            for(y = 0; y < 50; y++) {
                this.namer("./fooga" + x, ".fooga" + y);
            }
        }
        
        assert.equal(this.namer("./fooga" + 15, ".fooga" + 5), "f_5");
        assert.equal(this.namer("./fooga" + 1, ".fooga" + 5), "a1_5");
        assert.equal(this.namer("./fooga" + 49, ".fooga" + 33), "a1d_x");
    });
});
