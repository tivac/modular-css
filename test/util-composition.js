"use strict";

var assert = require("assert"),

    parse = require("../src/_composition");

describe("modular-css", function() {
    describe("util-composition", function() {
        describe("single identifier", function() {
            it("should fail to parse invalid identifiers", function() {
                assert.ok(!parse("./test/specimens/simple.css", ""));
                assert.ok(!parse("./test/specimens/simple.css", ","));
                assert.ok(!parse("./test/specimens/simple.css", "fooga+wooga"));
                assert.ok(!parse("./test/specimens/simple.css", "fooga>wooga"));
                assert.ok(!parse("./test/specimens/simple.css", "wooga.js"));
                assert.ok(!parse("./test/specimens/simple.css", "\"wooga.js\""));
                assert.ok(!parse("./test/specimens/simple.css", "from wooga.js"));
                assert.ok(!parse("./test/specimens/simple.css", "global(fooga booga)"));
            });

            it("should parse valid single identifiers", function() {
                assert.deepEqual(parse("./test/specimens/simple.css", "fooga"), {
                    rules  : [ "fooga" ],
                    source : false,
                    types  : {
                        fooga : "local"
                    }
                });

                assert.deepEqual(parse("./test/specimens/simple.css", "fooga-wooga"), {
                    rules  : [ "fooga-wooga" ],
                    source : false,
                    types  : {
                        "fooga-wooga" : "local"
                    }
                });

                assert.deepEqual(parse("./test/specimens/simple.css", "fooga_wooga"), {
                    rules  : [ "fooga_wooga" ],
                    source : false,
                    types  : {
                        fooga_wooga : "local"
                    }
                });

                assert.deepEqual(parse("./test/specimens/simple.css", "global(fooga)"), {
                    rules  : [ "fooga" ],
                    source : false,
                    types  : {
                        fooga : "global"
                    }
                });

                assert.deepEqual(parse("./test/specimens/simple.css", "global(  fooga  )"), {
                    rules  : [ "fooga" ],
                    source : false,
                    types  : {
                        fooga : "global"
                    }
                });

                assert.deepEqual(parse("./test/specimens/simple.css", "  fooga  "), {
                    rules  : [ "fooga" ],
                    source : false,
                    types  : {
                        fooga : "local"
                    }
                });
            });
    
            it("should parse single identifiers with a source", function() {
                assert.deepEqual(parse("./test/specimens/simple.css", "fooga from \"./local.css\""), {
                    rules  : [ "fooga" ],
                    source : "test/specimens/local.css",
                    types  : {
                        fooga : "local"
                    }
                });
                
                assert.deepEqual(parse("./test/specimens/simple.css", "fooga    from './local.css'"), {
                    rules  : [ "fooga" ],
                    source : "test/specimens/local.css",
                    types  : {
                        fooga : "local"
                    }
                });
            });
        });

        describe("multiple identifiers", function() {
            it("should fail to parse invalid identifiers", function() {
                assert.ok(!parse("./test/specimens/simple.css", "fooga wooga"));
                assert.ok(!parse("./test/specimens/simple.css", "fooga,"));
            });

            it("should parse multiple valid identifiers", function() {
                assert.deepEqual(parse("./test/specimens/simple.css", "fooga, googa"), {
                    rules  : [ "fooga", "googa" ],
                    source : false,
                    types  : {
                        fooga : "local",
                        googa : "local"
                    }
                });

                assert.deepEqual(parse("./test/specimens/simple.css", "fooga, global(googa)"), {
                    rules  : [ "fooga", "googa" ],
                    source : false,
                    types  : {
                        fooga : "local",
                        googa : "global"
                    }
                });
            });

            it("should parse multiple valid identifiers with a source", function() {
                assert.deepEqual(parse("./test/specimens/simple.css", "fooga, global(wooga) from \"./local.css\""), {
                    rules  : [ "fooga", "wooga" ],
                    source : "test/specimens/local.css",
                    types  : {
                        fooga : "local",
                        wooga : "global"
                    }
                });
            });
        });
    });
});
