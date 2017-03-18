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
            `).css))
            .toThrow(/Only simple singular selectors may use composition/);

            expect(() => process(dedent(`
                .red { color: red; }
                #id .class { composes: red; }
            `).css))
            .toThrow(/Only simple singular selectors may use composition/);
        });
        
        it("should fail if attempting to compose a class that doesn't exist", function() {
            var out = process(".wooga { composes: googa; }");
            
            expect(() => out.css).toThrow(/Invalid composes reference/);
        });
        
        it("should fail if composes isn't the first rule", function() {
            var out = process(".wooga { color: red; composes: googa; }");
            
            expect(() => out.css).toThrow(/composes must be the first declaration/);
        });
        
        it("should fail if classes have a cyclic dependency", function() {
            var out = process(".wooga { composes: booga; } .booga { composes: wooga; }");
            
            expect(() => out.css).toThrow(/Dependency Cycle Found: wooga -> booga -> wooga/);
        });

        it("should fail if imports are referenced without having been parsed", function() {
            var out = process(`.wooga { composes: booga from "./local.css"; }`, {
                    from  : "packages/core/test/specimens/wooga.css",
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
            
            out = process(".wooga { composes: googa from \"./local.css\"; }", {
                from  : path.resolve("./packages/core/test/specimens/wooga.css"),
                files : files
            });
            
            expect(() => out.css).toThrow(/Invalid composes reference/);
        });
        
        it("should fail when parsing an invalid value", function() {
            var out;

            out = process(".wooga { composes: global(); }");
            
            expect(() => out.css).toThrow(/SyntaxError: Expected/);

            out = process(".wooga { composes: fooga wooga; }");
            
            expect(() => out.css).toThrow(/SyntaxError: Expected/);
        });

        it("should output composition results as a message", function() {
            expect(process(dedent(`
                .wooga { color: red; }
                .fooga { composes: wooga; }
            `)).messages)
            .toMatchSnapshot();
        });

        it("should remove classes that only contain a composes rule from the output CSS", function() {
            expect(process(dedent(`
                .wooga { color: red; }
                .fooga { composes: wooga; }
            `)).css)
            .toMatchSnapshot();
        });
        
        it("should output removed classes as part of a message", function() {
            expect(process(dedent(`
                .wooga { color: red; }
                .fooga { composes: wooga; }
            `)).messages)
            .toMatchSnapshot();
        });

        it("should support IDs instead of classes", function() {
            expect(process(dedent(`
                #wooga { color: red; }
                .fooga { composes: wooga; }
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
                .wooga { color: red; }
                .booga { background: blue; }
                #tooga { composes: booga, wooga; }
            `)).messages)
            .toMatchSnapshot();
        });
        
        it("should support composing against later classes", function() {
            expect(process(dedent(`
                .wooga { composes: booga; }
                .booga { color: red; }
            `)).messages)
            .toMatchSnapshot();
        });

        it("should allow multiple composes declarations", function() {
            expect(process(dedent(`
                .wooga { }
                .booga { }
                .tooga { composes: wooga; composes: booga; }
            `)).messages)
            .toMatchSnapshot();
        });
        
        it("should support composing against global identifiers", function() {
            function check(input) {
                expect(process(input).messages).toMatchSnapshot();
            }

            check(".wooga { composes: global(booga); }");
            check(".wooga { composes: global(booga), global(tooga); }");
            check(".wooga { composes: global(booga); color: red; }");
            check(".tooga { } .wooga { composes: global(booga), tooga; }");
            check(".tooga { } .wooga { composes: global(booga), tooga; color: red; }");
            check(".tooga { } .wooga { composes: global(booga); composes: tooga; }");
            check(".tooga { } .wooga { composes: global(booga); composes: tooga; color: red; }");
        });

        it("should support composing against global identifiers w/ the same name", () => {
            expect(process(
                dedent(`
                    .wooga { composes: global(wooga); color: red; }
                `),
                {
                    from : "packages/core/test/specimens/simple.css"
                }
            ).messages)
            .toMatchSnapshot();
        });
        
        it("should handle multi-level dependencies", function() {
            expect(process(dedent(`
                .wooga { color: red; }
                .booga { composes: wooga; background: blue; }
                .tooga { composes: booga; display: block; }
            `)).messages)
            .toMatchSnapshot();
        });
        
        it("should find scoped identifiers from the scoping plugin's message", function() {
            expect(process(
                dedent(`
                    .wooga { color: red; }
                    .googa { composes: wooga; }
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
                    googa : [ "googa" ],
                    tooga : [ "tooga" ]
                }
            };
            
            expect(process(
                dedent(`
                    .wooga { composes: googa, tooga from "./local.css"; }
                `),
                {
                    from : path.resolve("./packages/core/test/specimens/wooga.css"),
                    files
                }
            ).messages)
            .toMatchSnapshot();
        });

        it("should expose imported heirachy details in the messages", function() {
            var files = {},
                out;
                
            files[path.resolve("./packages/core/test/specimens/local.css")] = {
                exports : {
                    googa : [ "googa" ],
                    tooga : [ "tooga" ]
                }
            };
            
            expect(process(
                dedent(`
                    .wooga { composes: googa from "./local.css"; }
                `),
                {
                    from  : path.resolve("./packages/core/test/specimens/wooga.css"),
                    files : files
                }
            ).messages)
            .toMatchSnapshot();
        });
    });
});
