"use strict";

var assert = require("assert"),
    
    rimraf = require("rimraf"),
    
    register = require("../src/register"),
    compare  = require("./lib/compare-files");

function unhook(ext) {
    delete require.extensions[ext || ".css"];
}

describe("modular-css", function() {
    describe("require() hook", function() {
        afterEach(function() {
            process.env.NODE_ENV = "";
            
            unhook();
        });
        
        after(function(done) {
            rimraf("./test/output/register", done);
        });
        
        it("should attach a handler to require.extensions", function() {
            register();
            
            assert.equal(typeof require.extensions[".css"], "function");
        });
        
        it("should return the options object", function() {
            var opts = register();
            
            assert.equal(typeof opts, "object");
            assert.equal(opts.ext, ".css");
            assert.equal(opts.map, false);
        });
        
        it("should supply a cleanup function", function() {
            var opts = register();
            
            assert.equal(typeof require.extensions[".css"], "function");
            
            assert.equal(typeof opts.remove, "function");
            
            opts.remove();
            
            assert.equal(typeof require.extensions[".css"], "undefined");
        });
        
        it("should accept options", function() {
            var opts = register({
                    ext : ".less",
                    map : true,
                    css : "./fooga.css"
                });
            
            assert.equal(opts.ext, ".less");
            assert.equal(opts.map, true);
            assert.equal(opts.css, "./fooga.css");
        });
        
        it("should use NODE_ENV to determine whether to include source maps", function() {
            var opts;
            
            opts = register();
            
            assert.equal(opts.map, false);
            
            process.env.NODE_ENV = "development";
            
            opts = register();
            
            assert.equal(opts.map, true);
        });
        
        it("should process the file and return its exported classnames", function() {
            var css;
            
            register();
            
            css = require("./specimens/simple.css");
            
            assert.equal(typeof css, "object");
            assert.deepEqual(css, {
                wooga : "mc08e91a5b_wooga"
            });
        });
        
        it("should write out css to disk", function(done) {
            register({
                css : "./test/output/register/start.css"
            });
            
            require("./specimens/start.css");
            
            setTimeout(function() {
                compare.results("register/start.css");
                
                done();
            }, 10);
        });
    });
});
