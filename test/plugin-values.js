var assert = require("assert"),
    plugin = require("../src/plugins/values");

function css(src, options) {
    return plugin.process(src, options).css;
}

describe("postcss-modular-css", function() {
    describe("values", function() {
        it("should fail to parse invalid declarations", function() {
            assert.throws(function() {
                css("@value green");
            });
            
            assert.throws(function() {
                css("@value red from './local.css");
            }, /Unclosed quote/);
        });

        it("should fail if imports are referenced without having been parsed", function() {
            assert.throws(function() {
                css("@value booga from \"./local.css\";", { from : "./test/specimens/no.css" });
            }, /Invalid file reference: booga from "\.\/local\.css"/);
        });

        it("should fail if importing from a file that doesn't exist", function() {
            assert.throws(function() {
                css("@value booga from \"./no.css\";", {
                    from  : "./test/specimens/start.css",
                    files : {
                        "test/specimens/local.css" : {
                            values : {}
                        }
                    }
                });
            }, /Cannot find module '\.\/no\.css'/);
        });

        it("should fail if non-existant imports are referenced", function() {
            assert.throws(function() {
                css("@value googa from \"./local.css\";", {
                    from  : "./test/specimens/wooga.css",
                    files : {
                        "test/specimens/local.css" : {
                            values : {}
                        }
                    }
                });
            }, /Invalid @value reference: googa/);
        });

        it("should early-out if no @value rules are defined", function() {
            assert.equal(
                css(".wooga { color: red; }"),
                ".wooga { color: red; }"
            );
        });

        it("should replace values in declarations", function() {
            assert.equal(
                css("@value color: red; .wooga { color: color; }"),
                ".wooga { color: red; }"
            );
        });

        it("should replace values in media queries", function() {
            assert.equal(
                css("@value small: (max-width: 599px); @media small { .wooga { color: red; } }"),
                "@media (max-width: 599px) { .wooga { color: red; } }"
            );
        });

        it("should support multiple values", function() {
            assert.equal(
                css("@value color: red; @value 2color: blue; .wooga { color: color; background: 2color; }"),
                ".wooga { color: red; background: blue; }"
            );
        });

        it("should support multiple values in a single declaration", function() {
            assert.equal(
                css("@value color: red; @value 2color: blue; .wooga { background: linear-gradient(color, 2color); }"),
                ".wooga { background: linear-gradient(red, blue); }"
            );
        });

        it("should support complex values", function() {
            assert.equal(
                css("@value base: 10px; @value large: calc(base * 2); .wooga { margin: large; }"),
                ".wooga { margin: calc(10px * 2); }"
            );
        });

        it("should support value heirarchies", function() {
            assert.equal(
                css("@value color: red; @value 2color: color; .wooga { color: 2color; }"),
                ".wooga { color: red; }"
            );

            assert.equal(
                css("@value color: red; @value 2color: color; @value 3color: 2color; .wooga { color: 3color; }"),
                ".wooga { color: red; }"
            );
        });

        it("should output exported values in a message", function() {
            var messages = plugin.process(
                    "@value color: red; @value 2color: color; @value other: 20px;"
                ).messages;
            
            assert.equal(messages.length, 1);
            assert.deepEqual(messages[0].values, {
                "2color" : "red",
                color    : "red",
                other    : "20px"
            });
        });

        it("should support importing values from other files", function() {
            assert.equal(
                css("@value googa from \"./local.css\"; .wooga { color: googa; }", {
                    from  : "./test/specimens/wooga.css",
                    files : {
                        "test/specimens/local.css" : {
                            values : {
                                googa : "red"
                            }
                        }
                    }
                }),
                ".wooga { color: red; }"
            );
        });
    });
});
