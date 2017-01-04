"use strict";

var assert = require("assert");

describe("module exports", function() {
    describe("default", function() {
        it("should be the processor", function() {
            var processor = require("../");
            
            assert.equal(typeof processor, "function");
            assert.equal(processor, require("../src/processor.js"));
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

    describe("/postcss", function() {
        it("should be the postcss plugin", function() {
            var postcss = require("../postcss.js");
            
            assert.equal(typeof postcss, "function");
            assert.equal(postcss, require("../src/postcss.js"));
        });
    });

    describe("/webpack", function() {
        it("/plugin should be the webpack plugin", function() {
            var plugin = require("../webpack/plugin.js");
            
            assert.equal(typeof plugin, "function");
            assert.equal(plugin, require("../src/webpack-plugin.js"));
        });

        it("/loader should be the webpack loader", function() {
            var loader = require("../webpack/loader.js");
            
            assert.equal(typeof loader, "function");
            assert.equal(loader, require("../src/webpack-loader.js"));
        });
    });
});
