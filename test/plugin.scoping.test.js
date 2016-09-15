"use strict";

var path   = require("path"),
    assert = require("assert"),
    
    assign = require("lodash.assign"),
    
    plugin = require("../src/plugins/scoping");

function msg(classes) {
    return {
        type    : "modularcss",
        plugin  : "postcss-modular-css-scoping",
        classes : classes
    };
}

function process(src, options) {
    return plugin.process(
        src,
        assign({
            from  : "test/specimens/a.css",
            namer : function(file, selector) {
                return `a_${selector}`;
            }
        },
        options || {})
    );
}

describe("/plugins", function() {
    describe("/scoping.js", function() {
        it("should generate a prefix for class names", function() {
            assert.equal(
                process(".wooga { color: red; }").css,
                ".a_wooga { color: red; }"
            );
        });
        
        it("should generate a prefix for ids", function() {
            assert.equal(
                process("#wooga { color: red; }").css,
                "#a_wooga { color: red; }"
            );
        });
        
        it("should ignore non-class/non-id selectors", function() {
            assert.equal(
                process("p { color: red; }").css,
                "p { color: red; }"
            );
        });

        it("should transform class/id selectors", function() {
            assert.equal(
                process(".wooga p { color: red; }").css,
                ".a_wooga p { color: red; }"
            );

            assert.equal(
                process("#wooga p { color: red; }").css,
                "#a_wooga p { color: red; }"
            );
            
            assert.equal(
                process("#wooga .booga { color: red; }").css,
                "#a_wooga .a_booga { color: red; }"
            );

            assert.equal(
                process("#wooga { color: red; } #wooga:hover { color: blue; }").css,
                "#a_wooga { color: red; } #a_wooga:hover { color: blue; }"
            );

            assert.equal(
                process(".wooga { color: red; } .wooga:hover { color: black; }").css,
                ".a_wooga { color: red; } .a_wooga:hover { color: black; }"
            );
        });
        
        it("should transform selectors within media queries", function() {
            assert.equal(
                process("@media (max-width: 100px) { .booga { color: red; } }").css,
                "@media (max-width: 100px) { .a_booga { color: red; } }"
            );
        });

        it("should transform the names of @keyframes rules", function() {
            assert.equal(
                process("@keyframes fooga { }").css,
                "@keyframes a_fooga { }"
            );

            assert.equal(
                process("@-webkit-keyframes fooga { }").css,
                "@-webkit-keyframes a_fooga { }"
            );

            assert.equal(
                process("@-moz-keyframes fooga { }").css,
                "@-moz-keyframes a_fooga { }"
            );
        });
        
        it("should expose original names in a message", function() {
            assert.deepEqual(
                process(
                    ".wooga { color: red; } " +
                    "#booga { color: black; } " +
                    "@keyframes fooga { 0% { color: red; } 100% { color: black; } }"
                ).messages,
                [ msg({
                    booga : [ "a_booga" ],
                    fooga : [ "a_fooga" ],
                    wooga : [ "a_wooga" ]
                }) ]
            );
        });

        describe(":global()", function() {
            it("should remove :global() from non-class/non-id selectors", function() {
                assert.equal(
                    process(":global(p) { color: red; }").css,
                    "p { color: red; }"
                );
            });

            it("should throw if :global is used without a child selector", function() {
                /* eslint no-unused-expressions:0 */
                assert.throws(function() {
                    process(":global p { color: red; }").css;
                }, /must not be empty/);
                
                assert.throws(function() {
                    process(":global() p { color: red; }").css;
                }, /must not be empty/);
            });

            it("should throw if global & local selectors overlap (issue 192)", function() {
                /* eslint no-unused-expressions:0 */
                assert.throws(function() {
                    process(".b { color: b; } :global(.b) { color: b; }").css;
                }, /Unable to re-use the same selector for global & local/);

                assert.throws(function() {
                    process(":global(.b) { color: b; } .b { color: b; }").css;
                }, /Unable to re-use the same selector for global & local/);
            })

            it("shouldn't transform global selectors", function() {
                assert.equal(
                    process(":global(.wooga) { color: red; }").css,
                    ".wooga { color: red; }"
                );
                
                assert.equal(
                    process(":global(#wooga) { color: red; }").css,
                    "#wooga { color: red; }"
                );
                
                assert.equal(
                    process("@media (max-width: 100px) { :global(.booga) { color: red; } }").css,
                    "@media (max-width: 100px) { .booga { color: red; } }"
                );

                assert.equal(
                    process("@keyframes :global(fooga) { 0% { color: red; } 100% { color: black; } }").css,
                    "@keyframes fooga { 0% { color: red; } 100% { color: black; } }"
                );
            });
            
            it("should support mixed local & global selectors", function() {
                assert.equal(
                    process(":global(#wooga), .booga { color: red; }").css,
                    "#wooga, .a_booga { color: red; }"
                );
                
                assert.equal(
                    process(":global(.wooga) .booga { color: red; }").css,
                    ".wooga .a_booga { color: red; }"
                );
                
                assert.equal(
                    process(".wooga :global(.booga) { color: red; }").css,
                    ".a_wooga .booga { color: red; }"
                );

                assert.equal(
                    process(".b { color: red; } :global(.c) { color: blue; }").css,
                    ".a_b { color: red; } .c { color: blue; }"
                )
                
                assert.equal(
                    process(".wooga :global(.booga) .fooga { color: red; }").css,
                    ".a_wooga .booga .a_fooga { color: red; }"
                );
            });
            
            it("should support multiple selectors", function() {
                assert.equal(
                    process(":global(.wooga .booga) { color: red; }"),
                    ".wooga .booga { color: red; }"
                );
            });

            it("should include :global(...) identifiers in a message", function() {
                assert.deepEqual(
                    process(
                        ":global(.wooga) { color: red; } " +
                        ":global(#fooga) { color: red; } " +
                        ":global(.googa .tooga) { color: red; } " +
                        "@keyframes :global(yooga) { 0% { color: red; } 100% { color: black; } }"
                    ).messages,
                    [ msg({
                        fooga : [ "fooga" ],
                        googa : [ "googa" ],
                        tooga : [ "tooga" ],
                        wooga : [ "wooga" ],
                        yooga : [ "yooga" ]
                    }) ]
                );
            });

            it("should support mixing local & global selectors in a single string", function() {
                var processed = process(".fooga :global(.wooga) { color: red; }");
                
                assert.equal(
                    processed.css,
                    ".a_fooga .wooga { color: red; }"
                );
                
                assert.deepEqual(
                    processed.messages,
                    [ msg({
                        fooga : [ "a_fooga" ],
                        wooga : [ "wooga" ]
                    }) ]
                );
            });
        });
    });
});
