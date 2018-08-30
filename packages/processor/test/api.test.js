"use strict";

const namer    = require("@modular-css/test-utils/namer.js");
const relative = require("@modular-css/test-utils/relative.js");

const Processor = require("../processor.js");

describe("/processor.js", () => {
    describe("API", () => {
        let processor;

        beforeEach(() => {
            processor = new Processor({
                namer,
            });
        });

        it("should be a function", () => {
            expect(typeof Processor).toBe("function");
        });
        
        describe(".string()", () => {
            it("should process a string", async () => {
                const result = await processor.string(
                    "./simple.css", ".wooga { }"
                );

                expect(result.exports).toMatchSnapshot();
                expect(result.details.exports).toMatchSnapshot();
                expect(result.details.text).toMatchSnapshot();
                expect(result.details.processed.root.toResult().css).toMatchSnapshot();
            });
        });
        
        describe(".file()", () => {
            it("should process a relative file", async () => {
                const result = await processor.file("./packages/processor/test/specimens/simple.css");

            
                expect(result.exports).toMatchSnapshot();
                expect(result.details.exports).toMatchSnapshot();
                expect(result.details.text).toMatchSnapshot();
                expect(result.details.processed.root.toResult().css).toMatchSnapshot();
            });

            it("should process an absolute file", async () => {
                const result = await processor.file(
                    require.resolve("./specimens/simple.css")
                );

                expect(result.exports).toMatchSnapshot();
                expect(result.details.exports).toMatchSnapshot();
                expect(result.details.text).toMatchSnapshot();
                expect(result.details.processed.root.toResult().css).toMatchSnapshot();
            });
        });
        
        describe(".remove()", () => {
            it("should remove a relative file", async () => {
                await processor.string(
                    "./simple.css",
                    ".wooga { }"
                );

                processor.remove("./simple.css");
                    
                expect(relative(processor.dependencies())).toMatchSnapshot();
            });

            it("should remove an absolute file", async () => {
                await processor.string(
                    "./packages/processor/test/specimens/simple.css",
                    ".wooga { }"
                );

                processor.remove(require.resolve("./specimens/simple.css"));
                    
                expect(relative(processor.dependencies())).toMatchSnapshot();
            });
            
            it("should remove multiple files", async () => {
                await processor.string("./a.css", ".a { }");
                await processor.string("./b.css", ".b { }");
                await processor.string("./c.css", ".c { }");
                
                processor.remove([
                    "./a.css",
                    "./b.css",
                ]);
                    
                expect(relative(processor.dependencies())).toMatchSnapshot();
            });
            
            it("should return an array of removed files", async () => {
                await processor.string("./a.css", ".a { }");
                await processor.string("./b.css", ".b { }");
                await processor.string("./c.css", ".c { }");
               
                expect(
                    relative(
                        processor.remove([
                            "./a.css",
                            "./b.css",
                        ])
                    )
                ).toMatchSnapshot();
            });
        });
        
        describe(".dependencies()", () => {
            it("should return the dependencies of the specified file", async () => {
                await processor.file("./packages/processor/test/specimens/start.css");
                
                expect(
                    relative(processor.dependencies(require.resolve("./specimens/start.css")))
                )
                .toMatchSnapshot();
            });
            
            it("should return the overall order of dependencies if no file is specified", async () => {
                await processor.file("./packages/processor/test/specimens/start.css");

                expect(relative(processor.dependencies())).toMatchSnapshot();
            });
        });

        describe(".dependents()", () => {
            it("should return the dependents of the specified file", async () => {
                await processor.file("./packages/processor/test/specimens/start.css");

                expect(
                    relative(processor.dependents(require.resolve("./specimens/local.css")))
                )
                .toMatchSnapshot();
            });
            
            it("should throw if no file is passed", async () => {
                await processor.file("./packages/processor/test/specimens/start.css");
                
                expect(() => processor.dependents()).toThrowErrorMatchingSnapshot();
            });
        });
        
        describe(".output()", () => {
            it("should return a postcss result", async () => {
                await processor.file("./packages/processor/test/specimens/start.css");
                
                const result = await processor.output();
                
                expect(result.css).toMatchSnapshot();
            });
            
            it("should generate css representing the output from all added files", async () => {
                await processor.file("./packages/processor/test/specimens/start.css");
                await processor.file("./packages/processor/test/specimens/simple.css");
                
                const result = await processor.output();

                expect(result.css).toMatchSnapshot();
            });

            it("should avoid duplicating files in the output", async () => {
                await processor.file("./packages/processor/test/specimens/start.css");
                await processor.file("./packages/processor/test/specimens/local.css");
                
                const result = await processor.output();

                expect(result.css).toMatchSnapshot();
            });
            
            it("should generate a JSON structure of all the compositions", async () => {
                await processor.file("./packages/processor/test/specimens/start.css");
                
                const result = await processor.output();

                expect(result.compositions).toMatchSnapshot();
            });
            
            it("should order output by dependencies, then alphabetically", async () => {
                await processor.file("./packages/processor/test/specimens/start.css");
                await processor.file("./packages/processor/test/specimens/local.css");
                await processor.file("./packages/processor/test/specimens/composes.css");
                await processor.file("./packages/processor/test/specimens/deep.css");
                
                const result = await processor.output();

                expect(result.css).toMatchSnapshot();
            });

            it("should support returning output for specified relative files", async () => {
                await processor.file("./packages/processor/test/specimens/start.css");
                await processor.file("./packages/processor/test/specimens/local.css");
                
                const result = await processor.output({
                    files : [
                        "./packages/processor/test/specimens/start.css",
                    ],
                });

                expect(result.css).toMatchSnapshot();
            });

            it("should support returning output for specified absolute files", async () => {
                await processor.file("./packages/processor/test/specimens/start.css");
                await processor.file("./packages/processor/test/specimens/local.css");
                
                const result = await processor.output({
                    files : [
                        require.resolve("./specimens/start.css"),
                    ],
                });

                expect(result.css).toMatchSnapshot();
            });

            it("should reject if called before input has been processed", () => {
                processor.file(require.resolve("./specimens/start.css"));

                return expect(processor.output()).rejects.toMatchSnapshot();
            });

            it("should allow for seperate source map output", async () => {
                await processor.file("./packages/processor/test/specimens/start.css");
                
                const result = await processor.output({
                    map : {
                        inline : false,
                    },
                });

                expect(result.map).toMatchSnapshot();
            });
        });

        describe("._resolve()", () => {
            it("should run resolvers until a match is found", () => {
                var ran = false;

                processor = new Processor({
                    resolvers : [
                        () => {
                            ran = true;
                        },
                    ],
                });
                
                expect(
                    relative([
                        processor._resolve(
                            require.resolve("./specimens/start.css"),
                            "./local.css"
                        ),
                    ])
                )
                .toMatchSnapshot();

                expect(ran).toBeTruthy();
            });

            it("should fall back to a default resolver", () => {
                processor = new Processor({
                    resolvers : [
                        () => undefined,
                    ],
                });
                
                expect(
                    relative([
                        processor._resolve(
                            require.resolve("./specimens/start.css"),
                            "./local.css"
                        ),
                    ])
                )
                .toMatchSnapshot();
            });
        });
    });
});
