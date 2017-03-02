"use strict";

var assert = require("assert"),

    dedent = require("dentist").dedent,
    
    Processor = require("modular-css-core"),
    namer     = require("test-utils/namer.js"),

    paths = require("../paths.js");

describe("/paths.js", function() {
    it("should return a falsey value if a file isn't found", function() {
        var fn = paths({
            paths : [
                "./packages/paths/test/specimens"
            ]
        });

        assert.ok(!fn(".", "./fooga.css"));
    });

    it("should return the absolute path if a file is found", function() {
        var fn = paths({
            paths : [
                "./packages/paths/test/specimens/one"
            ]
        });

        expect(fn(".", "./one.css")).toBe(require.resolve("./specimens/one/one.css"));
    });

    it("should check multiple paths for files & return the first match", function() {
        var fn = paths({
            paths : [
                "./packages/paths/test/specimens/one",
                "./packages/paths/test/specimens/one/sub"
            ]
        });

        expect(fn(".", "./sub.css")).toBe(require.resolve("./specimens/one/sub/sub.css"));
    });

    it("should be usable as a modular-css resolver", function() {
        var processor = new Processor({
                namer,
                resolvers : [
                    paths({
                        paths : [
                            "./packages/paths/test/specimens/one/sub",
                            "./packages/paths/test/specimens/two"
                        ]
                    })
                ]
            });
        
        return processor.string(
            "./packages/paths/test/specimens/one/start.css",
            dedent(`
                @value sub from "./sub.css";
                
                .rule {
                    composes: two from "./two.css";
                }
            `)
        )
        .then(() => processor.output())
        .then((result) => assert.deepEqual(
            result.compositions,
            {
                "packages/paths/test/specimens/one/start.css" : {
                    rule : "two rule"
                },

                "packages/paths/test/specimens/one/sub/sub.css" : {
                    "sub" : "sub"
                },

                "packages/paths/test/specimens/two/two.css" : {
                    "two" : "two"
                }
            }
        ));
    });
});
