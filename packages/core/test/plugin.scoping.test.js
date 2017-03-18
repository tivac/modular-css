"use strict";

var assert = require("assert"),
    
    dedent = require("dedent"),

    plugin = require("../plugins/scoping.js"),
    
    processor = require("postcss")([ plugin ]);

function msg(things, name) {
    return {
        type   : "modular-css",
        plugin : "modular-css-scoping",

        [ name || "classes" ] : things
    };
}

function process(src, options) {
    return processor.process(
        src,
        Object.assign(Object.create(null), {
            from  : "packages/core/test/specimens/a.css",
            namer : (file, selector) => `a_${selector}`
        },
        options || {})
    );
}

describe("/plugins", function() {
    describe("/scoping.js", function() {
        it("should generate a prefix for class names", function() {
            expect(process(".wooga { color: red; }").css).toMatchSnapshot();
        });
        
        it("should generate a prefix for ids", function() {
            expect(process("#wooga { color: red; }").css).toMatchSnapshot();
        });
        
        it("should ignore non-class/non-id selectors", function() {
            expect(process("p { color: red; }").css).toMatchSnapshot();
        });

        it("should transform class/id selectors", function() {
            expect(process(".wooga p { color: red; }").css).toMatchSnapshot();
            expect(process("#wooga p { color: red; }").css).toMatchSnapshot();
            expect(process("#wooga .booga { color: red; }").css).toMatchSnapshot();
            expect(process("#wooga { color: red; } #wooga:hover { color: blue; }").css).toMatchSnapshot();
            expect(process(".wooga { color: red; } .wooga:hover { color: black; }").css).toMatchSnapshot();
        });
        
        it("should transform selectors within media queries", function() {
            expect(process("@media (max-width: 100px) { .booga { color: red; } }").css).toMatchSnapshot();
        });

        it("should transform multiple grouped selectors ", function() {
            expect(process(".one, .two { color: red; }").css).toMatchSnapshot();
        });

        it("should transform the names of @keyframes rules", function() {
            expect(process("@keyframes fooga { }").css).toMatchSnapshot();
            expect(process("@-webkit-keyframes fooga { }").css).toMatchSnapshot();
            expect(process("@-moz-keyframes fooga { }").css).toMatchSnapshot();
        });
        
        it("should expose original names in a message", function() {
            expect(
                process(dedent(`
                    .wooga { color: red; }
                    #booga { color: black; }
                    @keyframes fooga {
                        0% { color: red; }
                        100% { color: black; }
                    }
                `)).messages,
                [
                    msg({
                        fooga : [ "a_fooga" ]
                    }, "keyframes"),
                    msg({
                        booga : [ "a_booga" ],
                        wooga : [ "a_wooga" ]
                    })
                ]
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
                expect(
                    () => process(":global p { color: red; }").css
                )
                .toThrow(/must not be empty/);

                expect(
                    () => process(":global() p { color: red; }").css
                )
                .toThrow(/must not be empty/);
            });

            it("should throw if global & local selectors overlap (issue 192)", function() {
                expect(
                    () => process(".b { color: b; } :global(.b) { color: b; }").css
                )
                .toThrow(/Unable to re-use the same selector for global & local/);

                expect(
                    () => process(":global(.b) { color: b; } .b { color: b; }").css
                )
                .toThrow(/Unable to re-use the same selector for global & local/);

                expect(
                    () => process(":global(.b) { color: b; } :global(.a .b) { color: b; }").css
                )
                .not.toThrow();

                expect(
                    () => process(":global(.b) { color: b; } .a :global(.b) { color: b; }").css
                )
                .not.toThrow();
            });

            it("shouldn't transform global selectors", function() {
                expect(
                    process(":global(.wooga) { color: red; }").css
                )
                .toMatchSnapshot();
                
                expect(
                    process(":global(#wooga) { color: red; }").css
                )
                .toMatchSnapshot();
                
                expect(
                    process("@media (max-width: 100px) { :global(.booga) { color: red; } }").css
                )
                .toMatchSnapshot();

                expect(
                    process("@keyframes :global(fooga) { 0% { color: red; } 100% { color: black; } }").css
                )
                .toMatchSnapshot();
            });
            
            it("should support mixed local & global selectors", function() {
                expect(
                    process(":global(#wooga), .booga { color: red; }").css
                )
                .toMatchSnapshot();
                
                expect(
                    process(":global(.wooga) .booga { color: red; }").css
                )
                .toMatchSnapshot();
                
                expect(
                    process(".wooga :global(.booga) { color: red; }").css
                )
                .toMatchSnapshot();

                expect(
                    process(".b { color: red; } :global(.c) { color: blue; }").css
                )
                .toMatchSnapshot();
                
                expect(
                    process(".wooga :global(.booga) .fooga { color: red; }").css
                )
                .toMatchSnapshot();
            });
            
            it("should support multiple selectors", function() {
                expect(
                    process(":global(.wooga .booga) { color: red; }")
                )
                .toMatchSnapshot();
            });

            it("should include :global(...) identifiers in a message", function() {
                expect(
                    process(dedent(`
                        :global(.wooga) { color: red; }
                        :global(#fooga) { color: red; }
                        :global(.googa .tooga) { color: red; }
                        @keyframes :global(yooga) {
                            0% {
                                color: red;
                            }
                            
                            100% {
                                color: black;
                            }
                        }
                    `)).messages
                )
                .toMatchSnapshot();
            });

            it("should support mixing local & global selectors in a single string", function() {
                var processed = process(".fooga :global(.wooga) { color: red; }");
                
                expect(processed.css).toMatchSnapshot();
                expect(processed.messages).toMatchSnapshot();
            });
        });
    });
});
