"use strict";

var assert = require("assert");

describe("modular-css", function() {
    describe("exports", function() {
        describe("default", function() {
            it("should be the processor", function() {
                var processor = require("../");
                
                assert.equal(typeof processor, "function");
                assert.equal(processor, require("../src/processor"));
            });
        });
        
        describe("/browserify", function() {
            it("should be the browserify plugin", function() {
                var browserify = require("../browserify");
                
                assert.equal(typeof browserify, "function");
                assert.equal(browserify, require("../src/browserify"));
            });
        });
    });
});
