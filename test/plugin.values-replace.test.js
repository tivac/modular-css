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
        it("should noop without values to replace", function() {
            assert.equal(
                plugin.process(".wooga { color: red; }").css,
                ".wooga { color: red; }"
            );
        });

        describe("local values", function() {
            var css = postcss([ local, plugin ]);
            
            it("should noop without values to replace", function() {
                assert.equal(
                    css.process("@value color: red; .wooga { color: color; }").css,
                    ".wooga { color: red; }"
                );
            });

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

                assert.equal(
                    css.process("@value red: #F00; @value color: red; @value value: color; .wooga { color: value; }").css,
                    ".wooga { color: #F00; }"
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
                assert.equal(
                    css.process(`@value color from "./local.css"; .wooga { color: color; }`, {
                        map   : false,
                        from  : path.resolve("./test/specimens/in.css"),
                        files : {
                            // Composition source
                            [ path.resolve("./test/specimens/in.css") ] : {},

                            // Composition target
                            [ path.resolve("./test/specimens/local.css") ] : {
                                values : {
                                    color : {
                                        value  : "#F00",
                                        source : {}
                                    }
                                }
                            }
                        }
                    }).css,
                    ".wooga { color: #F00; }"
                );
            });
        });

        describe("namespaced values", function() {
            var css = postcss([ namespaced, plugin ]);
            
            it("should replace values in declarations", function() {
                assert.equal(
                    css.process(`@value * as colors from "./local.css"; .wooga { color: colors.red; }`, {
                        map   : false,
                        from  : path.resolve("./test/specimens/in.css"),
                        files : {
                            // Composition source
                            [ path.resolve("./test/specimens/in.css") ] : {},

                            // Composition target
                            [ path.resolve("./test/specimens/local.css") ] : {
                                values : {
                                    red : {
                                        value  : "#F00",
                                        source : {}
                                    }
                                }
                            }
                        }
                    }).css,
                    ".wooga { color: #F00; }"
                );
            });
        });

        describe("combined", function() {
            var css = postcss([ local, namespaced, composed, plugin ]);

            it("should replace values in declarations", function() {
                assert.equal(
                    css.process(
                        `@value * as colors from "./local.css";` +
                        `@value red from "./local.css";` +
                        `@value r: colors.red;` +
                        `.wooga { color: colors.red; background: red; border: 1px solid r; }`, {
                        map   : false,
                        from  : path.resolve("./test/specimens/in.css"),
                        files : {
                            // Composition source
                            [ path.resolve("./test/specimens/in.css") ] : {},

                            // Composition target
                            [ path.resolve("./test/specimens/local.css") ] : {
                                values : {
                                    red : {
                                        value  : "#F00",
                                        source : {}
                                    }
                                }
                            }
                        }
                    }).css,
                    ".wooga { color: #F00; background: #F00; border: 1px solid #F00; }"
                );
            });
        });
    });
});
