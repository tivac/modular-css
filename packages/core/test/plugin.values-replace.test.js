"use strict";

var path   = require("path"),
    assert = require("assert"),
    
    postcss = require("postcss"),
    dedent  = require("dedent"),

    plugin     = require("../plugins/values-replace.js"),
    local      = require("../plugins/values-local.js"),
    composed   = require("../plugins/values-composed.js"),
    exported   = require("../plugins/values-export.js"),
    namespaced = require("../plugins/values-namespaced.js"),
    
    resolve = require("../lib/resolve.js").resolve;

describe("/plugins", function() {
    describe("/values-replace.js", function() {
        it("should noop without values to replace", function() {
            expect(
                postcss([ plugin ]).process(".wooga { color: red; }").css
            )
            .toMatchSnapshot();
        });

        describe("local values", function() {
            var processor = postcss([ local, exported, plugin ]);

            function process(css) {
                return processor.process(css, {
                    resolve,
                    
                    from  : "file",
                    files : {
                        file : {
                            values : false
                        }
                    }
                });
            }
            
            it("should replace values in declarations", function() {
                expect(
                    process(dedent(`
                        @value color: red;
                        
                        .wooga {
                            color: color;
                        }
                    `)).css
                )
                .toMatchSnapshot();
            });

            it("should replace value references in @value declarations", function() {
                expect(
                    process(dedent(`
                        @value color: red;
                        @value value: color;
                        
                        .wooga {
                            color: value;
                        }
                    `)).css
                )
                .toMatchSnapshot();

                expect(
                    process(dedent(`
                        @value red: #F00;
                        @value color: red;
                        @value value: color;
                        
                        .wooga {
                            color: value;
                        }
                    `)).css
                )
                .toMatchSnapshot();
            });

            it("should replace values in media queries", function() {
                expect(
                    process(dedent(`
                        @value small: (max-width: 599px);
                        
                        @media small { }
                    `)).css
                )
                .toMatchSnapshot();
            });

            it("should replace values surrounded by non-word characters (#245)", function() {
                expect(
                    process(dedent(`
                        @value one: 10px;
                        @value two: calc(one - 2px);
                        
                        .a {
                            height: two;
                            width: -one;
                            color: twoodle;
                        }
                    `)).css
                )
                .toMatchSnapshot();
            });
        });

        describe("composed values", function() {
            var css = postcss([ composed, exported, plugin ]);
            
            it("should replace values in declarations", function() {
                expect(
                    css.process(dedent(`
                        @value color from "./local.css";
                        .wooga {
                            color: color;
                        }
                    `), {
                        resolve,
                        
                        map   : false,
                        from  : path.resolve("./packages/core/test/specimens/in.css"),
                        files : {
                            // Composition source
                            [ path.resolve("./packages/core/test/specimens/in.css") ] : {},

                            // Composition target
                            [ path.resolve("./packages/core/test/specimens/local.css") ] : {
                                values : {
                                    color : {
                                        value  : "#F00",
                                        source : {}
                                    }
                                }
                            }
                        }
                    }).css
                )
                .toMatchSnapshot();
            });
        });

        describe("namespaced values", function() {
            var css = postcss([ namespaced, exported, plugin ]);
            
            it("should replace values in declarations", function() {
                expect(
                    css.process(dedent(`
                        @value * as colors from "./local.css";
                        .wooga {
                            color: colors.red;
                        }
                    `), {
                        resolve,

                        map   : false,
                        from  : path.resolve("./packages/core/test/specimens/in.css"),
                        files : {
                            // Composition source
                            [ path.resolve("./packages/core/test/specimens/in.css") ] : {},

                            // Composition target
                            [ path.resolve("./packages/core/test/specimens/local.css") ] : {
                                values : {
                                    red : {
                                        value  : "#F00",
                                        source : {}
                                    }
                                }
                            }
                        }
                    }).css
                )
                .toMatchSnapshot();
            });
        });

        describe("combined", function() {
            var css = postcss([ local, namespaced, composed, exported, plugin ]);

            it("should replace values in declarations", function() {
                expect(
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
                        resolve,
                        
                        map   : false,
                        from  : path.resolve("./packages/core/test/specimens/in.css"),
                        files : {
                            // Composition source
                            [ path.resolve("./packages/core/test/specimens/in.css") ] : {},

                            // Composition target
                            [ path.resolve("./packages/core/test/specimens/local.css") ] : {
                                values : {
                                    red : {
                                        value  : "#F00",
                                        source : {}
                                    }
                                }
                            }
                        }
                    }).css
                )
                .toMatchSnapshot();
            });
        });
    });
});
