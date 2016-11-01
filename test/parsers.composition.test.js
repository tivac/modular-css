"use strict";

var assert = require("assert"),
    path   = require("path"),
    
    postcss = require("postcss"),

    composition = require("../src/parsers/composition.js");

describe("/parsers", function() {
    describe("/composition.js", function() {
        describe(".parse()", function() {
            var parse = composition.parse;
            
            describe("single identifier", function() {
                it("should fail to parse invalid identifiers", function() {
                    assert.throws(() => parse(""));
                    assert.throws(() => parse(","));
                    assert.throws(() => parse("fooga+wooga"));
                    assert.throws(() => parse("fooga>wooga"));
                    assert.throws(() => parse("wooga.js"));
                    assert.throws(() => parse(`"wooga.js"`));
                    assert.throws(() => parse("from wooga.js"));
                    assert.throws(() => parse("global(fooga booga)"));
                    assert.throws(() => parse("fooga from super"));
                });

                it("should parse valid single identifiers", function() {
                    assert.deepEqual(parse("fooga"), {
                        refs : [
                            { name : "fooga" }
                        ],
                        source : false
                    });

                    assert.deepEqual(parse("fooga-wooga"), {
                        refs : [
                            { name : "fooga-wooga" }
                        ],
                        source : false
                    });

                    assert.deepEqual(parse("fooga_wooga"), {
                        refs : [
                            { name : "fooga_wooga" }
                        ],
                        source : false
                    });
                    
                    assert.deepEqual(parse("  fooga  "), {
                        refs : [
                            { name : "fooga" }
                        ],
                        source : false
                    });

                    assert.deepEqual(parse("global(fooga)"), {
                        refs : [ {
                            name   : "fooga",
                            global : true
                        } ],
                        source : false
                    });

                    assert.deepEqual(parse("global(  fooga  )"), {
                        refs : [ {
                            name   : "fooga",
                            global : true
                        } ],
                        source : false
                    });
                });

                it("should parse single identifiers with a source", function() {
                    assert.deepEqual(parse(`fooga from "./local.css"`), {
                        refs : [
                            { name : "fooga" }
                        ],
                        source : "./local.css"
                    });

                    assert.deepEqual(parse(`fooga from './local.css'`), {
                        refs : [
                            { name : "fooga" }
                        ],
                        source : "./local.css"
                    });
                    
                    assert.deepEqual(parse("fooga    from './local.css'"), {
                        refs : [
                            { name : "fooga" }
                        ],
                        source : "./local.css"
                    });
                });

                it("should parse wildcard identifiers with a source", function() {
                    assert.deepEqual(parse(`* as fooga from "./local.css"`), {
                        refs  : [ {
                            name      : "fooga",
                            namespace : true
                        } ],
                        source : "./local.css"
                    });
                });
            });

            describe("multiple identifiers", function() {
                it("should fail to parse invalid identifiers", function() {
                    assert.throws(() => parse("fooga wooga"));
                });

                it("should parse multiple valid identifiers", function() {
                    assert.deepEqual(parse("fooga, googa"), {
                        refs : [
                            { name : "fooga" },
                            { name : "googa" }
                        ],
                        source : false
                    });

                    assert.deepEqual(parse("fooga, global(googa)"), {
                        refs : [
                            { name : "fooga" },
                            { name : "googa", global : true }
                        ],
                        source : false
                    });
                });

                it("should parse multiple valid identifiers with a source", function() {
                    assert.deepEqual(parse(`fooga, wooga from "./local.css"`), {
                        refs : [
                            { name : "fooga" },
                            { name : "wooga" }
                        ],
                        source : "./local.css"
                    });
                    
                    assert.deepEqual(parse(`fooga, global(wooga) from "./local.css"`), {
                        refs : [
                            { name : "fooga" },
                            { name : "wooga", global : true }
                        ],
                        source : "./local.css"
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
                        refs : [
                            { name : "booga" }
                        ],
                        source : false
                    }
                );
            });
            
            it("should resolve file sources", function() {
                assert.deepEqual(
                    composition.decl(from, parse(".a { composes: fooga from \"./local.css\"; }").first),
                    {
                        refs : [
                            { name : "fooga" }
                        ],
                        source : path.resolve("./test/specimens/local.css")
                    }
                );
            });
            
            it("shouldn't mix local & global values", () => {
                assert.deepEqual(
                    composition.decl(from, parse(".a { composes: global(a); }").first),
                    {
                        refs : [
                            { name : "a", global : true }
                        ],
                        source : false
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
                        refs : [
                            { name : "fooga" }
                        ],
                        source : path.resolve("./test/specimens/local.css")
                    }
                );
            });
        });
    });
});
