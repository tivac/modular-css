"use strict";

var assert = require("assert");

describe("module exports", function() {
    describe("default", function() {
        it("should be the plugin", function() {
            var plugin = require("../index.js");
            
            assert.equal(typeof plugin, "function");
            assert.equal(plugin, require("../src/plugin.js"));
        });
    });
    
    describe("/browserify", function() {
        it("should be the browserify plugin", function() {
            var browserify = require("../browserify.js");
            
            assert.equal(typeof browserify, "function");
            assert.equal(browserify, require("../src/browserify.js"));
        });
    });
    
    describe("/rollup", function() {
        it("should be the rollup plugin", function() {
            var rollup = require("../rollup.js");
            
            assert.equal(typeof rollup, "function");
            assert.equal(rollup, require("../src/rollup.js"));
        });
    });

    describe("/glob", function() {
        it("should be the glob function", function() {
            var glob = require("../glob.js");
            
            assert.equal(typeof glob, "function");
            assert.equal(glob, require("../src/glob.js"));
        });
    });
});
