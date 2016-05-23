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
            from  : "test/specimens/simple.css",
            namer : function(file, selector) {
                return path.basename(file, path.extname(file)) + "_" + selector;
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
                ".simple_wooga { color: red; }"
            );
        });
        
        it("should generate a prefix for ids", function() {
            assert.equal(
                process("#wooga { color: red; }").css,
                "#simple_wooga { color: red; }"
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
                ".simple_wooga p { color: red; }"
            );

            assert.equal(
                process("#wooga p { color: red; }").css,
                "#simple_wooga p { color: red; }"
            );
            
            assert.equal(
                process("#wooga .booga { color: red; }").css,
                "#simple_wooga .simple_booga { color: red; }"
            );

            assert.equal(
                process("#wooga { color: red; } #wooga:hover { color: blue; }").css,
                "#simple_wooga { color: red; } #simple_wooga:hover { color: blue; }"
            );

            assert.equal(
                process(".wooga { color: red; } .wooga:hover { color: black; }").css,
                ".simple_wooga { color: red; } .simple_wooga:hover { color: black; }"
            );
        });
        
        it("should transform selectors within media queries", function() {
            assert.equal(
                process("@media (max-width: 100px) { .booga { color: red; } }").css,
                "@media (max-width: 100px) { .simple_booga { color: red; } }"
            );
        });

        it("should transform the names of @keyframes rules", function() {
            assert.equal(
                process("@keyframes fooga { }").css,
                "@keyframes simple_fooga { }"
            );

            assert.equal(
                process("@-webkit-keyframes fooga { }").css,
                "@-webkit-keyframes simple_fooga { }"
            );

            assert.equal(
                process("@-moz-keyframes fooga { }").css,
                "@-moz-keyframes simple_fooga { }"
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
                    booga : [ "simple_booga" ],
                    fooga : [ "simple_fooga" ],
                    wooga : [ "simple_wooga" ]
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
                    process(":global(#wooga), .wooga { color: red; }").css,
                    "#wooga, .simple_wooga { color: red; }"
                );
                
                assert.equal(
                    process(":global(.wooga) .booga { color: red; }").css,
                    ".wooga .simple_booga { color: red; }"
                );
                
                assert.equal(
                    process(".wooga :global(.booga) { color: red; }").css,
                    ".simple_wooga .booga { color: red; }"
                );
                
                assert.equal(
                    process(".wooga :global(.booga) .fooga { color: red; }").css,
                    ".simple_wooga .booga .simple_fooga { color: red; }"
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
                    ".simple_fooga .wooga { color: red; }"
                );
                
                assert.deepEqual(
                    processed.messages,
                    [ msg({
                        fooga : [ "simple_fooga" ],
                        wooga : [ "wooga" ]
                    }) ]
                );
            });
        });
    });
});
