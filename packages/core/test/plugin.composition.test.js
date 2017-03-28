"use strict";

var path   = require("path"),

    postcss = require("postcss"),
    dedent  = require("dedent"),
    
    resolve = require("../lib/resolve.js").resolve,

    namer = require("test-utils/namer.js"),

    scoping     = require("../plugins/scoping.js"),
    composition = require("../plugins/composition.js");

describe("/plugins", function() {
    describe("/composition.js", function() {
        /* eslint max-statements:0 */
        var process;
        
        beforeEach(function() {
            var processor = postcss([ scoping, composition ]);
            
            process = (css, opts) => processor.process(css, Object.assign(
                Object.create(null),
                {
                    resolve,
                    namer
                },
                opts
            ));
        });

        it("should fail if the selector is not a simple, singular selector", function() {
            expect(() => process(dedent(`
                .red { color: red; }
                .one .two .three { composes: red; }
            `)).css)
            .toThrow(/Only simple singular selectors may use composition/);

            expect(() => process(dedent(`
                .red { color: red; }
                #id .class { composes: red; }
            `)).css)
            .toThrow(/Only simple singular selectors may use composition/);
        });
        
        it("should fail if attempting to compose a class that doesn't exist", function() {
            var out = process(".a { composes: b; }");
            
            expect(() => out.css).toThrow(/Invalid composes reference/);
        });
        
        it("should fail if composes isn't the first rule", function() {
            var out = process(".a { color: red; composes: b; }");
            
            expect(() => out.css).toThrow(/composes must be the first declaration/);
        });

        it("should allow comments before composes", function() {
            expect(process(dedent(`
                .a {
                    color: red;
                }

                .b {
                    color: blue;
                }

                .c {
                    /* Comment */
                    /* Comment */
                    /* Comment */
                    composes: a;
                    /* Comment */
                    composes: b;
                }
            `)).messages)
            .toMatchSnapshot();
        });
        
        it("should fail if classes have a cyclic dependency", function() {
            var out = process(".a { composes: b; } .b { composes: a; }");
            
            expect(() => out.css).toThrow(/Dependency Cycle Found: a -> b -> a/);
        });

        it("should fail if imports are referenced without having been parsed", function() {
            var out = process(`.a { composes: b from "./local.css"; }`, {
                    from  : "packages/core/test/specimens/a.css",
                    files : {}
                });
            
            expect(() => out.css).toThrow(/Invalid file reference/);
        });

        it("should fail if non-existant imports are referenced", function() {
            var files = {},
            out;
                
            files[path.resolve("./packages/core/test/specimens/local.css")] = {
                exports : {}
            };
            
            out = process(".a { composes: b from \"./local.css\"; }", {
                from  : path.resolve("./packages/core/test/specimens/a.css"),
                files : files
            });
            
            expect(() => out.css).toThrow(/Invalid composes reference/);
        });
        
        it("should fail when parsing an invalid value", function() {
            var out;

            out = process(".a { composes: global(); }");
            
            expect(() => out.css).toThrow(/SyntaxError: Expected/);

            out = process(".a { composes: b a; }");
            
            expect(() => out.css).toThrow(/SyntaxError: Expected/);
        });

        it("should output composition results as a message", function() {
            expect(process(dedent(`
                .a { color: red; }
                .b { composes: a; }
            `)).messages)
            .toMatchSnapshot();
        });

        it("should remove classes that only contain a composes rule from the output CSS", function() {
            expect(process(dedent(`
                .a { color: red; }
                .b { composes: a; }
            `)).css)
            .toMatchSnapshot();
        });
        
        it("should output removed classes as part of a message", function() {
            expect(process(dedent(`
                .a { color: red; }
                .b { composes: a; }
            `)).messages)
            .toMatchSnapshot();
        });

        it("should support IDs instead of classes", function() {
            expect(process(dedent(`
                #a { color: red; }
                .b { composes: a; }
            `)).messages)
            .toMatchSnapshot();
        });

        it("should support multiple singular selectors", function() {
            expect(() => process(dedent(`
                .red { color: red; }
                .one, .two { composes: red; }
            `).css))
            .not.toThrow();
            
            expect(() => process(dedent(`
                .red { color: red; }
                #one, .two { composes: red; }
            `).css))
            .not.toThrow();
        });
        
        it("should output the class hierarchy in a message", function() {
            expect(process(dedent(`
                .a { color: red; }
                .b { background: blue; }
                #c { composes: b, a; }
            `)).messages)
            .toMatchSnapshot();
        });
        
        it("should support composing against later classes", function() {
            expect(process(dedent(`
                .a { composes: b; }
                .b { color: red; }
            `)).messages)
            .toMatchSnapshot();
        });

        it("should allow multiple composes declarations", function() {
            expect(process(dedent(`
                .a { }
                .b { }
                .c { composes: a; composes: b; }
            `)).messages)
            .toMatchSnapshot();
        });
        
        it("should support composing against global identifiers", function() {
            function check(input) {
                expect(process(input).messages).toMatchSnapshot();
            }

            check(".a { composes: global(b); }");
            check(".a { composes: global(b), global(c); }");
            check(".a { composes: global(b); color: red; }");
            check(".c { } .a { composes: global(b), c; }");
            check(".c { } .a { composes: global(b), c; color: red; }");
            check(".c { } .a { composes: global(b); composes: c; }");
            check(".c { } .a { composes: global(b); composes: c; color: red; }");
        });

        it("should support composing against global identifiers w/ the same name", () => {
            expect(process(
                dedent(`
                    .a { composes: global(a); color: red; }
                `),
                {
                    from : "packages/core/test/specimens/simple.css"
                }
            ).messages)
            .toMatchSnapshot();
        });
        
        it("should handle multi-level dependencies", function() {
            expect(process(dedent(`
                .a { color: red; }
                .b { composes: a; background: blue; }
                .c { composes: b; display: block; }
            `)).messages)
            .toMatchSnapshot();
        });
        
        it("should find scoped identifiers from the scoping plugin's message", function() {
            expect(process(
                dedent(`
                    .a { color: red; }
                    .b { composes: a; }
                `),
                {
                    from : "packages/core/test/specimens/simple.css",
                    namer
                }
            ).messages)
            .toMatchSnapshot();
        });
        
        it("should compose multiple classes from imports", function() {
            var files = {};
                
            files[path.resolve("./packages/core/test/specimens/local.css")] = {
                exports : {
                    b : [ "b" ],
                    c : [ "c" ]
                }
            };
            
            expect(process(
                dedent(`
                    .a { composes: b, c from "./local.css"; }
                `),
                {
                    from : path.resolve("./packages/core/test/specimens/a.css"),
                    files
                }
            ).messages)
            .toMatchSnapshot();
        });

        it("should expose imported heirachy details in the messages", function() {
            var files = {};
                
            files[path.resolve("./packages/core/test/specimens/local.css")] = {
                exports : {
                    b : [ "b" ],
                    c : [ "c" ]
                }
            };
            
            expect(
                process(
                    dedent(`
                        .a { composes: b from "./local.css"; }
                    `),
                    {
                        from  : path.resolve("./packages/core/test/specimens/a.css"),
                        files : files
                    }
                ).messages
            )
            .toMatchSnapshot();
        });
    });
});
