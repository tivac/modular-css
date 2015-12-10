var assert = require("assert"),
    plugin = require("../src/plugins/values-composed");

function css(src, options) {
    return plugin.process(src, options).css;
}

describe("postcss-modular-css", function() {
    describe("values-composed plugin", function() {
        it("should fail to parse invalid declarations", function() {
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
            }, /Unable to locate/);
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
