"use strict";

var assert = require("assert"),

    imports = require("../src/_imports");

describe("postcss-modular-css", function() {
    describe("util-imports", function() {
        it("should export a format regexp", function() {
            assert.ok(imports.format instanceof RegExp);
        });

        it("should export a match function", function() {
            assert.equal(typeof imports.match, "function");
        });

        it("should export a parse function", function() {
            assert.equal(typeof imports.parse, "function");
        });

        describe(".match()", function() {
            it("should match valid imports", function() {
                assert.ok(imports.match("fooga from 'wooga.js'"));
                assert.ok(imports.match("fooga from \"wooga.js\""));
                assert.ok(imports.match("fooga, wooga from \"wooga.js\""));
            });

            it("should fail invalid imports", function() {
                assert.ok(!imports.match("from wooga.js"));
                assert.ok(!imports.match("wooga.js"));
                assert.ok(!imports.match("\"wooga.js\""));
            });
        });

        describe(".parse()", function() {
            it("should barf on invalid input", function() {
                assert.ok(!imports.parse("foo", "f from g"));
                assert.ok(!imports.parse("foo", "f g"));
            });

            it("should return keys and a path", function() {
                assert.deepEqual(
                    imports.parse("./test/specimens/simple.css", "f from \"./local.css\""),
                    {
                        keys   : [ "f" ],
                        source : "test/specimens/local.css"
                    }
                );
            });

            it("should return multiple keys and a path", function() {
                assert.deepEqual(
                    imports.parse("./test/specimens/simple.css", "f, g, h from \"./local.css\""),
                    {
                        keys   : [ "f", "g", "h" ],
                        source : "test/specimens/local.css"
                    }
                );
            });

            it("should return keys and a path from node_modules", function() {
                assert.deepEqual(
                    imports.parse("./test/specimens/simple.css", "f from \"styles\""),
                    {
                        keys   : [ "f" ],
                        source : "test/specimens/node_modules/styles/styles.css"
                    }
                );
            });
        });
    });
});
