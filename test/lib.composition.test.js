"use strict";

var assert = require("assert"),
    path   = require("path"),
    
    postcss = require("postcss"),

    composition = require("../src/lib/composition");

describe("/lib", function() {
    describe("/composition.js", function() {
        describe(".parse()", function() {
            var parse = composition.parse;
            
            describe("single identifier", function() {
                it("should fail to parse invalid identifiers", function() {
                    assert.ok(!parse(""));
                    assert.ok(!parse(","));
                    assert.ok(!parse("fooga+wooga"));
                    assert.ok(!parse("fooga>wooga"));
                    assert.ok(!parse("wooga.js"));
                    assert.ok(!parse("\"wooga.js\""));
                    assert.ok(!parse("from wooga.js"));
                    assert.ok(!parse("global(fooga booga)"));
                });

                it("should parse valid single identifiers", function() {
                    assert.deepEqual(parse("fooga"), {
                        rules  : [ "fooga" ],
                        source : false,
                        types  : {
                            fooga : "local"
                        }
                    });

                    assert.deepEqual(parse("fooga-wooga"), {
                        rules  : [ "fooga-wooga" ],
                        source : false,
                        types  : {
                            "fooga-wooga" : "local"
                        }
                    });

                    assert.deepEqual(parse("fooga_wooga"), {
                        rules  : [ "fooga_wooga" ],
                        source : false,
                        types  : {
                            fooga_wooga : "local"
                        }
                    });

                    assert.deepEqual(parse("global(fooga)"), {
                        rules  : [ "fooga" ],
                        source : false,
                        types  : {
                            fooga : "global"
                        }
                    });

                    assert.deepEqual(parse("global(  fooga  )"), {
                        rules  : [ "fooga" ],
                        source : false,
                        types  : {
                            fooga : "global"
                        }
                    });

                    assert.deepEqual(parse("  fooga  "), {
                        rules  : [ "fooga" ],
                        source : false,
                        types  : {
                            fooga : "local"
                        }
                    });
                });

                it("should parse single identifiers with a source", function() {
                    assert.deepEqual(parse("fooga from \"./local.css\""), {
                        rules  : [ "fooga" ],
                        source : "./local.css",
                        types  : {
                            fooga : "local"
                        }
                    });
                    
                    assert.deepEqual(parse("fooga    from './local.css'"), {
                        rules  : [ "fooga" ],
                        source : "./local.css",
                        types  : {
                            fooga : "local"
                        }
                    });
                });
            });

            describe("multiple identifiers", function() {
                it("should fail to parse invalid identifiers", function() {
                    assert.ok(!parse("fooga wooga"));
                    assert.ok(!parse("fooga,"));
                });

                it("should parse multiple valid identifiers", function() {
                    assert.deepEqual(parse("fooga, googa"), {
                        rules  : [ "fooga", "googa" ],
                        source : false,
                        types  : {
                            fooga : "local",
                            googa : "local"
                        }
                    });

                    assert.deepEqual(parse("fooga, global(googa)"), {
                        rules  : [ "fooga", "googa" ],
                        source : false,
                        types  : {
                            fooga : "local",
                            googa : "global"
                        }
                    });
                });

                it("should parse multiple valid identifiers with a source", function() {
                    assert.deepEqual(parse("fooga, global(wooga) from \"./local.css\""), {
                        rules  : [ "fooga", "wooga" ],
                        source : "./local.css",
                        types  : {
                            fooga : "local",
                            wooga : "global"
                        }
                    });
                });
            });
        });
        
        describe(".decl()", function() {
            var from = path.resolve("./test/specimens/simple.css");
            
            function parse(css) {
                return postcss.parse(css).first;
            }
            
            it("should throw on errors", function() {
                assert.throws(function() {
                    composition.decl(from, parse(".a { composes: fooga wooga; }").first);
                }, /Unable to parse composition/);
                
                assert.throws(function() {
                    composition.decl(from, parse(".a { color: red; composes: fooga wooga; }").nodes[1]);
                }, /composes must be the first declaration in the rule/);
                
                assert.throws(function() {
                    composition.decl(from, parse(".a { composes: fooga from \"./wooga\"; }").first);
                }, /Unable to locate/);
            });
            
            it("should allow multiple composes declarations", function() {
                assert.deepEqual(
                    composition.decl(from, parse(".a { composes: fooga; composes: booga; }").nodes[1]),
                    {
                        rules  : [ "booga" ],
                        source : false,
                        types  : {
                            booga : "local"
                        }
                    }
                );
            });
            
            it("should resolve file sources", function() {
                assert.deepEqual(
                    composition.decl(from, parse(".a { composes: fooga from \"./local.css\"; }").first),
                    {
                        rules  : [ "fooga" ],
                        source : path.resolve("./test/specimens/local.css"),
                        types  : {
                            fooga : "local"
                        }
                    }
                );
            });
            
            it("shouldn't resolve \"super\" as a file source", function() {
                assert.deepEqual(
                    composition.decl(from, parse(".a { composes: fooga from super; }").first),
                    {
                        rules  : [ "fooga" ],
                        source : "super",
                        types  : {
                            fooga : "local"
                        }
                    }
                );
            });
        });
        
        describe(".rule()", function() {
            var from = path.resolve("./test/specimens/simple.css");
            
            function parse(css) {
                return postcss.parse(css).first;
            }
            
            it("should throw on errors", function() {
                assert.throws(function() {
                    composition.rule(from, parse("@value foo from "));
                }, /Unable to parse composition/);
            });
            
            it("should resolve file sources", function() {
                assert.deepEqual(
                    composition.rule(from, parse("@value fooga from \"./local.css\";")),
                    {
                        rules  : [ "fooga" ],
                        source : path.resolve("./test/specimens/local.css"),
                        types  : {
                            fooga : "local"
                        }
                    }
                );
            });
            
            it("shouldn't resolve \"super\" as a file source", function() {
                assert.deepEqual(
                    composition.rule(from, parse("@value fooga from super;")),
                    {
                        rules  : [ "fooga" ],
                        source : "super",
                        types  : {
                            fooga : "local"
                        }
                    }
                );
            });
        });
    });
});
