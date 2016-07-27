"use strict";

var assert = require("assert");

describe("module exports", function() {
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
    
    describe("/rollup", function() {
        it("should be the rollup plugin", function() {
            var rollup = require("../rollup");
            
            assert.equal(typeof rollup, "function");
            assert.equal(rollup, require("../src/rollup"));
        });
    });

    describe("/glob", function() {
        it("should be the glob function", function() {
            var glob = require("../glob");
            
            assert.equal(typeof glob, "function");
            assert.equal(glob, require("../src/glob"));
        });
    });
});
