"use strict";

var dedent = require("dedent"),

    plugin = require("../plugins/scoping.js"),
    
    processor = require("postcss")([ plugin ]);

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
            expect(process(".a { color: red; }").css).toMatchSnapshot();
        });
        
        it("should generate a prefix for ids", function() {
            expect(process("#a { color: red; }").css).toMatchSnapshot();
        });
        
        it("should ignore non-class/non-id selectors", function() {
            expect(process("p { color: red; }").css).toMatchSnapshot();
        });

        it("should transform class/id selectors", function() {
            expect(process(".a p { color: red; }").css).toMatchSnapshot();
            expect(process("#a p { color: red; }").css).toMatchSnapshot();
            expect(process("#a .b { color: red; }").css).toMatchSnapshot();
            expect(process("#a { color: red; } #a:hover { color: blue; }").css).toMatchSnapshot();
            expect(process(".a { color: red; } .a:hover { color: black; }").css).toMatchSnapshot();
        });
        
        it("should transform selectors within media queries", function() {
            expect(process("@media (max-width: 100px) { .b { color: red; } }").css).toMatchSnapshot();
        });

        it("should transform multiple grouped selectors ", function() {
            expect(process(".one, .two { color: red; }").css).toMatchSnapshot();
        });

        it("should transform the names of @keyframes rules", function() {
            expect(process("@keyframes a { }").css).toMatchSnapshot();
            expect(process("@-webkit-keyframes a { }").css).toMatchSnapshot();
            expect(process("@-moz-keyframes a { }").css).toMatchSnapshot();
        });
        
        it("should expose original names in a message", function() {
            expect(
                process(dedent(`
                    .a { color: red; }
                    #b { color: black; }
                    @keyframes c {
                        0% { color: red; }
                        100% { color: black; }
                    }
                `)).messages
            )
            .toMatchSnapshot();
        });

        describe(":global()", function() {
            it("should remove :global() from non-class/non-id selectors", function() {
                expect(
                    process(":global(p) { color: red; }").css
                )
                .toMatchSnapshot();
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
                    process(":global(.a) { color: red; }").css
                )
                .toMatchSnapshot();
                
                expect(
                    process(":global(#a) { color: red; }").css
                )
                .toMatchSnapshot();
                
                expect(
                    process("@media (max-width: 100px) { :global(.b) { color: red; } }").css
                )
                .toMatchSnapshot();

                expect(
                    process("@keyframes :global(c) { 0% { color: red; } 100% { color: black; } }").css
                )
                .toMatchSnapshot();
            });
            
            it("should support mixed local & global selectors", function() {
                expect(
                    process(":global(#a), .b { color: red; }").css
                )
                .toMatchSnapshot();
                
                expect(
                    process(":global(.a) .b { color: red; }").css
                )
                .toMatchSnapshot();
                
                expect(
                    process(".a :global(.b) { color: red; }").css
                )
                .toMatchSnapshot();

                expect(
                    process(".b { color: red; } :global(.c) { color: blue; }").css
                )
                .toMatchSnapshot();
                
                expect(
                    process(".a :global(.b) .c { color: red; }").css
                )
                .toMatchSnapshot();
            });
            
            it("should support multiple selectors", function() {
                expect(
                    process(":global(.a .b) { color: red; }").css
                )
                .toMatchSnapshot();
            });

            it("should include :global(...) identifiers in a message", function() {
                expect(
                    process(dedent(`
                        :global(.a) { color: red; }
                        :global(#b) { color: red; }
                        :global(.c .d) { color: red; }
                        @keyframes :global(e) {
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

            it("should not include :global(...) identifiers in a message with disabled exportGlobals", function() {
                expect(
                    process(dedent(`
                        :global(.a) { color: red; }
                        :global(#b) { color: red; }
                        :global(.c .d) { color: red; }
                        .e {}
                        @keyframes :global(f) {
                            0% { color: red; }
                            100% { color: black; }
                        }
                        @keyframes g {
                            0% { color: red; }
                            100% { color: black; }
                        }
                    `), {
                        exportGlobals: false
                    }).messages
                )
                .toMatchSnapshot();
            });

            it("should support mixing local & global selectors in a single string", function() {
                var processed = process(".c :global(.a) { color: red; }");
                
                expect(processed.css).toMatchSnapshot();
                expect(processed.messages).toMatchSnapshot();
            });
        });
    });
});
