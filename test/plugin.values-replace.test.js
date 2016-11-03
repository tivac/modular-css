"use strict";

var path   = require("path"),
    assert = require("assert"),
    
    postcss = require("postcss"),

    plugin     = require("../src/plugins/values-replace.js"),
    local      = require("../src/plugins/values-local.js"),
    composed   = require("../src/plugins/values-composed.js"),
    namespaced = require("../src/plugins/values-namespaced.js");

describe("/plugins", function() {
    describe("/values-replace.js", function() {
        var process;
        
        describe("local values", function() {
            var css = postcss([ local, plugin ]);
            
            it("should replace values in declarations", function() {
                assert.equal(
                    css.process("@value color: red; .wooga { color: color; }").css,
                    ".wooga { color: red; }"
                );
            });

            it("should replace value references in @value declarations", function() {
                assert.equal(
                    css.process("@value color: red; @value value: color; .wooga { color: value; }").css,
                    ".wooga { color: red; }"
                );
            });

            it("should replace values in media queries", function() {
                assert.equal(
                    css.process("@value small: (max-width: 599px); @media small { }").css,
                    "@media (max-width: 599px) { }"
                );
            });
        });

        describe("composed values", function() {
            var css = postcss([ composed, plugin ]);
            
            it("should replace values in declarations", function() {
                this.timeout(0);
                
                assert.equal(
                    css.process(`@value color from "./local.css"; .wooga { color: color; }`, {
                        map   : false,
                        from  : path.resolve("./test/specimens/in.css"),
                        files : {
                            // Composition source
                            [path.resolve("./test/specimens/in.css")] : {},

                            // Composition target
                            [path.resolve("./test/specimens/local.css")] : {
                                values : {
                                    color : {
                                        value  : "red",
                                        source : {}
                                    }
                                }
                            }
                        }
                    }).css,
                    ".wooga { color: red; }"
                );
            });

            it("should replace value references in @value declarations", function() {
                assert.equal(
                    css.process("@value color: red; @value value: color; .wooga { color: value; }").css,
                    ".wooga { color: red; }"
                );
            });

            it("should replace values in media queries", function() {
                assert.equal(
                    css.process("@value small: (max-width: 599px); @media small { }").css,
                    "@media (max-width: 599px) { }"
                );
            });
        });

        describe("namedspaced values", function() {
            var css = postcss([ namespaced, plugin ]);
            
            it("should replace values in declarations", function() {
                assert.equal(
                    css.process("@value color: red; .wooga { color: color; }").css,
                    ".wooga { color: red; }"
                );
            });

            it("should replace value references in @value declarations", function() {
                assert.equal(
                    css.process("@value color: red; @value value: color; .wooga { color: value; }").css,
                    ".wooga { color: red; }"
                );
            });

            it("should replace values in media queries", function() {
                assert.equal(
                    css.process("@value small: (max-width: 599px); @media small { }").css,
                    "@media (max-width: 599px) { }"
                );
            });
        });


        it.skip("should write exported values to the files object", function() {
            var files = {
                    "test.css" : {}
                };
                
            plugin.process(
                "@value color: red; @value 2color: color; @value other: 20px;",
                {
                    files : files,
                    from  : "test.css"
                }
            ).css;
            
            assert.deepEqual(files["test.css"].values, {
                "2color" : "red",
                color    : "red",
                other    : "20px"
            });
        });
    });
});
