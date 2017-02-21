"use strict";

var assert = require("assert"),

    dedent = require("dentist").dedent,
    
    Processor = require("modular-css-core"),

    paths = require("../paths.js");

describe("/paths.js", function() {
    it("should return a falsey value if a file isn't found", function() {
        var fn = paths({
            paths : [
                "./test/specimens"
            ]
        });

        assert.ok(!fn(".", "./fooga.css"));
    });

    it("should return the absolute path if a file is found", function() {
        var fn = paths({
            paths : [
                "./test/specimens/one"
            ]
        });

        assert.equal(
            fn(".", "./one.css"),
            require.resolve("./specimens/one/one.css")
        );
    });

    it("should check multiple paths for files & return the first match", function() {
        var fn = paths({
            paths : [
                "./test/specimens/one",
                "./test/specimens/one/sub"
            ]
        });

        assert.equal(
            fn(".", "./sub.css"),
            require.resolve("./specimens/one/sub/sub.css")
        );
    });

    it("should be usable as a modular-css resolver", function() {
        var processor = new Processor({
                resolvers : [
                    paths({
                        paths : [
                            "./test/specimens/one/sub",
                            "./test/specimens/two"
                        ]
                    })
                ]
            });
        
        return processor.string(
            "./test/specimens/one/start.css",
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
                "test/specimens/one/start.css" : {
                    rule : "mc16fc57c4_two mc2632bbcb_rule"
                },

                "test/specimens/one/sub/sub.css" : {
                    "sub" : "mc8e516949_sub"
                },

                "test/specimens/two/two.css" : {
                    "two" : "mc16fc57c4_two"
                }
            }
        ));
    });
});
