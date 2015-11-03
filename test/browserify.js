"use strict";

var mock = require("mock-fs"),
    
    fs     = require("fs"),
    path   = require("path"),
    assert = require("assert"),
    
    browserify = require("browserify"),
    
    transform = require("../src/browserify"),
    
    cwd = process.cwd();

describe("postcss-css-modules", function() {
    describe("browserify", function() {
        before(function() {
            mock(require("./_file-system"));
        });
        
        after(mock.restore);
        
        it("should run browserify", function(done) {
            var build = browserify("./client.js");
            
            build.transform(transform);
            
            build.bundle(function(err, out) {
                var js  = out.toString(),
                    css = fs.readFileSync("./start-compiled.css", "utf8");
                
                assert(js.indexOf("module.exports = {\"wooga\":[\"f5507abd3eea0987714c5d92c3230347_booga\"],\"booga\":[\"2ba8076ec1145293c7e3600dbc63b306_booga\"],\"tooga\":[\"2ba8076ec1145293c7e3600dbc63b306_tooga\"]};") > -1);
                
                assert(css.indexOf(".dafdfcc7dc876084d352519086f9e6e9_folder { margin: 2px; }") > -1);
                assert(css.indexOf(".f5507abd3eea0987714c5d92c3230347_booga { background: green; }") > -1);
                assert(css.indexOf(".2ba8076ec1145293c7e3600dbc63b306_booga { color: red; background: blue; }") > -1);
                assert(css.indexOf(".2ba8076ec1145293c7e3600dbc63b306_tooga { border: 1px solid white; }") > -1);
                
                done();
            });
        });
    });
});
