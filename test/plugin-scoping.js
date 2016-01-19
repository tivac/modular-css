var assert = require("assert"),
    assign = require("lodash.assign"),
    plugin = require("../src/plugins/scoping");

function css(src, options) {
    return plugin.process(src, assign({ from : "test/specimens/simple.css" }, options || {})).css;
}

describe("modular-css", function() {
    describe("scoping", function() {
        it("should generate a prefix for class names", function() {
            assert.equal(
                css(".wooga { color: red; }"),
                ".mc08e91a5b_wooga { color: red; }"
            );
        });
        
        it("should generate a prefix for ids", function() {
            assert.equal(
                css("#wooga { color: red; }"),
                "#mc08e91a5b_wooga { color: red; }"
            );
        });
        
        it("should ignore non-class/non-id selectors", function() {
            assert.equal(
                css("p { color: red; }"),
                "p { color: red; }"
            );
        });

        it("should transform class/id selectors", function() {
            assert.equal(
                css(".wooga p { color: red; }"),
                ".mc08e91a5b_wooga p { color: red; }"
            );

            assert.equal(
                css("#wooga p { color: red; }"),
                "#mc08e91a5b_wooga p { color: red; }"
            );
            
            assert.equal(
                css("#wooga .booga { color: red; }"),
                "#mc08e91a5b_wooga .mc08e91a5b_booga { color: red; }"
            );

            assert.equal(
                css("#wooga { color: red; } #wooga:hover { color: blue; }"),
                "#mc08e91a5b_wooga { color: red; } #mc08e91a5b_wooga:hover { color: blue; }"
            );

            assert.equal(
                css(".wooga { color: red; } .wooga:hover { color: black; }"),
                ".mc08e91a5b_wooga { color: red; } .mc08e91a5b_wooga:hover { color: black; }"
            );
        });
        
        it("should transform selectors within media queries", function() {
            assert.equal(
                css("@media (max-width: 100px) { .booga { color: red; } }"),
                "@media (max-width: 100px) { .mc08e91a5b_booga { color: red; } }"
            );
        });

        it("should transform the names of @keyframes rules", function() {
            assert.equal(
                css("@keyframes fooga { }"),
                "@keyframes mc08e91a5b_fooga { }"
            );

            assert.equal(
                css("@-webkit-keyframes fooga { }"),
                "@-webkit-keyframes mc08e91a5b_fooga { }"
            );

            assert.equal(
                css("@-moz-keyframes fooga { }"),
                "@-moz-keyframes mc08e91a5b_fooga { }"
            );
        });
        
        it("should use a supplied string prefix for names", function() {
            assert.equal(
                css(".wooga { color: red; }", { prefix : "tooga" }),
                ".tooga_wooga { color: red; }"
            );
        });
        
        it("should call a naming function for names", function() {
            assert.equal(
                css(".wooga { color: red; }", {
                    namer : function(file, selector) {
                        return "googa_" + selector;
                    }
                }),
                ".googa_wooga { color: red; }"
            );
        });
        
        it("should expose original names in a message", function() {
            var result = plugin.process(
                ".wooga { color: red; } #booga { color: black; } @keyframes fooga { 0% { color: red; } 100% { color: black; } }",
                { from : "test/specimens/simple.css" }
            );
            
            assert.deepEqual(result.messages, [ {
                type    : "modularcss",
                plugin  : "postcss-modular-css-scoping",
                classes : {
                    booga : "mc08e91a5b_booga",
                    fooga : "mc08e91a5b_fooga",
                    wooga : "mc08e91a5b_wooga"
                }
            } ]);
        });

        describe(":global()", function() {
            it("should remove :global() from non-class/non-id selectors", function() {
                assert.equal(
                    css(":global(p) { color: red; }"),
                    "p { color: red; }"
                );
            });

            it("should throw if :global is used without a child selector", function() {
                assert.throws(function() {
                    css(":global p { color: red; }");
                }, /:global\(\.\.\.\) requires a child selector/);

                assert.throws(function() {
                    css(":global() p { color: red; }");
                }, /:global\(\.\.\.\) requires a child selector/);
            });

            it("shouldn't transform global selectors", function() {
                assert.equal(
                    css(":global(.wooga) { color: red; }"),
                    ".wooga { color: red; }"
                );
                
                assert.equal(
                    css(":global(#wooga) { color: red; }"),
                    "#wooga { color: red; }"
                );
                
                assert.equal(
                    css("@media (max-width: 100px) { :global(.booga) { color: red; } }"),
                    "@media (max-width: 100px) { .booga { color: red; } }"
                );

                assert.equal(
                    css("@keyframes :global(fooga) { 0% { color: red; } 100% { color: black; } }"),
                    "@keyframes fooga { 0% { color: red; } 100% { color: black; } }"
                );
            });
            
            it("should support mixed local & global selectors", function() {
                assert.equal(
                    css(":global(#wooga), .wooga { color: red; }"),
                    "#wooga, .mc08e91a5b_wooga { color: red; }"
                );
            });

            it("should support multiple selectors", function() {
                assert.equal(
                    css(":global(.wooga .booga) { color: red; }"),
                    ".wooga .booga { color: red; }"
                );
            });

            it("should include :global(...) identifiers in a message", function() {
                var result = plugin.process(
                        ":global(.wooga) { color: red; } " +
                        ":global(#fooga) { color: red; } " +
                        ":global(.googa .tooga) { color: red; } " +
                        "@keyframes :global(yooga) { 0% { color: red; } 100% { color: black; } }",
                        { from : "test/specimens/simple.css" }
                    );
                
                assert.deepEqual(result.messages, [ {
                    type    : "modularcss",
                    plugin  : "postcss-modular-css-scoping",
                    classes : {
                        fooga : "fooga",
                        googa : "googa",
                        tooga : "tooga",
                        wooga : "wooga",
                        yooga : "yooga"
                    }
                } ]);
            });
        });
    });
});
