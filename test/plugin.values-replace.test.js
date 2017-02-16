"use strict";

var path   = require("path"),
    assert = require("assert"),
    
    postcss = require("postcss"),
    dedent  = require("dentist").dedent,

    plugin     = require("../src/plugins/values-replace.js"),
    local      = require("../src/plugins/values-local.js"),
    composed   = require("../src/plugins/values-composed.js"),
    exported   = require("../src/plugins/values-export.js"),
    namespaced = require("../src/plugins/values-namespaced.js");

describe("/plugins", function() {
    describe("/values-replace.js", function() {
        it("should noop without values to replace", function() {
            assert.equal(
                postcss([ plugin ]).process(".wooga { color: red; }").css,
                ".wooga { color: red; }"
            );
        });

        describe("local values", function() {
            var processor = postcss([ local, exported, plugin ]);

            function process(css) {
                return processor.process(css, {
                    from  : "file",
                    files : {
                        "file" : {
                            values : false
                        }
                    }
                });
            }
            
            it("should replace values in declarations", function() {
                assert.equal(
                    process(dedent(`
                        @value color: red;
                        
                        .wooga {
                            color: color;
                        }
                    `)).css,
                    dedent(`
                        .wooga {
                            color: red;
                        }
                    `)
                );
            });

            it("should replace value references in @value declarations", function() {
                assert.equal(
                    process(dedent(`
                        @value color: red;
                        @value value: color;
                        
                        .wooga {
                            color: value;
                        }
                    `)).css,
                    dedent(`
                        .wooga {
                            color: red;
                        }
                    `)
                );

                assert.equal(
                    process(dedent(`
                        @value red: #F00;
                        @value color: red;
                        @value value: color;
                        
                        .wooga {
                            color: value;
                        }
                    `)).css,
                    dedent(`
                        .wooga {
                            color: #F00;
                        }
                    `)
                );
            });

            it("should replace values in media queries", function() {
                assert.equal(
                    process(dedent(`
                        @value small: (max-width: 599px);
                        
                        @media small { }
                    `)).css,
                    dedent(`
                        @media (max-width: 599px) { }
                    `)
                );
            });

            it("should replace values surrounded by non-word characters (#245)", function() {
                assert.equal(
                    process(dedent(`
                        @value one: 10px;
                        @value two: calc(one - 2px);
                        
                        .a {
                            height: two;
                            width: -one;
                            color: twoodle;
                        }
                    `)).css,
                    dedent(`
                        .a {
                            height: calc(10px - 2px);
                            width: -10px;
                            color: twoodle;
                        }
                    `)
                );
            });
        });

        describe("composed values", function() {
            var css = postcss([ composed, exported, plugin ]);
            
            it("should replace values in declarations", function() {
                assert.equal(
                    css.process(dedent(`
                        @value color from "./local.css";
                        .wooga {
                            color: color;
                        }
                    `), {
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
                    dedent(`
                        .wooga {
                            color: #F00;
                        }
                    `)
                );
            });
        });

        describe("namespaced values", function() {
            var css = postcss([ namespaced, exported, plugin ]);
            
            it("should replace values in declarations", function() {
                assert.equal(
                    css.process(dedent(`
                        @value * as colors from "./local.css";
                        .wooga {
                            color: colors.red;
                        }
                    `), {
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
                    dedent(`
                        .wooga {
                            color: #F00;
                        }
                    `)
                );
            });
        });

        describe("combined", function() {
            var css = postcss([ local, namespaced, composed, exported, plugin ]);

            it("should replace values in declarations", function() {
                assert.equal(
                    css.process(dedent(`
                        @value * as colors from "./local.css";
                        @value red from "./local.css";
                        @value r: colors.red;
                        .wooga {
                            color: colors.red;
                            background: red;
                            border: 1px solid r;
                        }
                    `), {
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
                    dedent(`
                        .wooga {
                            color: #F00;
                            background: #F00;
                            border: 1px solid #F00;
                        }
                    `)
                );
            });
        });
    });
});
