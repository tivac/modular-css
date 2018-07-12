"use strict";

var namer    = require("test-utils/namer.js"),
    relative = require("test-utils/relative.js"),

    Processor = require("../processor.js");

describe("/processor.js", () => {
    describe("API", () => {
        var processor;

        beforeEach(() => {
            processor = new Processor({
                namer,
            });
        });

        it("should be a function", () =>
            expect(typeof Processor).toBe("function")
        );
        
        it("should auto-instantiate if called without new", () =>
            /* eslint new-cap:0 */
            expect(Processor()).toBeInstanceOf(Processor)
        );

        describe(".string()", () => {
            it("should process a string", () =>
                processor.string(
                    "./simple.css", ".wooga { }"
                )
                .then((result) => {
                    expect(result.exports).toMatchSnapshot();
                    expect(result.details.exports).toMatchSnapshot();
                    expect(result.details.text).toMatchSnapshot();
                    expect(result.details.processed.root.toResult().css).toMatchSnapshot();
                })
            );
        });
        
        describe(".file()", () => {
            it("should process a relative file", () =>
                processor.file(
                    "./packages/core/test/specimens/simple.css"
                )
                .then((result) => {
                    expect(result.exports).toMatchSnapshot();
                    expect(result.details.exports).toMatchSnapshot();
                    expect(result.details.text).toMatchSnapshot();
                    expect(result.details.processed.root.toResult().css).toMatchSnapshot();
                })
            );

            it("should process an absolute file", () =>
                processor.file(
                    require.resolve("./specimens/simple.css")
                )
                .then((result) => {
                    expect(result.exports).toMatchSnapshot();
                    expect(result.details.exports).toMatchSnapshot();
                    expect(result.details.text).toMatchSnapshot();
                    expect(result.details.processed.root.toResult().css).toMatchSnapshot();
                })
            );
        });
        
        describe(".remove()", () => {
            it("should remove a relative file", () =>
                processor.string(
                    "./simple.css",
                    ".wooga { }"
                )
                .then(() => {
                    processor.remove("./simple.css");
                    
                    expect(relative(processor.dependencies())).toMatchSnapshot();
                })
            );

            it("should remove an absolute file", () =>
                processor.string(
                    "./packages/core/test/specimens/simple.css",
                    ".wooga { }"
                )
                .then(() => {
                    processor.remove(require.resolve("./specimens/simple.css"));
                    
                    expect(relative(processor.dependencies())).toMatchSnapshot();
                })
            );
            
            it("should remove multiple files", () =>
                Promise.all([
                    processor.string("./a.css", ".a { }"),
                    processor.string("./b.css", ".b { }"),
                    processor.string("./c.css", ".c { }"),
                ])
                .then(() => {
                    processor.remove([
                        "./a.css",
                        "./b.css",
                    ]);
                    
                    expect(relative(processor.dependencies())).toMatchSnapshot();
                })
            );
            
            it("should return an array of removed files", () =>
                Promise.all([
                    processor.string("./a.css", ".a { }"),
                    processor.string("./b.css", ".b { }"),
                    processor.string("./c.css", ".c { }"),
                ])
                .then(() => {
                    expect(
                        relative(
                            processor.remove([
                                "./a.css",
                                "./b.css",
                            ])
                        )
                    ).toMatchSnapshot();
                })
            );
        });
        
        describe(".dependencies()", () => {
            it("should return the dependencies of the specified file", () =>
                processor.file(
                    "./packages/core/test/specimens/start.css"
                )
                .then(() =>
                    expect(
                        relative(processor.dependencies(require.resolve("./specimens/start.css")))
                    )
                    .toMatchSnapshot()
                )
            );
            
            it("should return the overall order of dependencies if no file is specified", () =>
                processor.file(
                    "./packages/core/test/specimens/start.css"
                )
                .then(() =>
                    expect(relative(processor.dependencies())).toMatchSnapshot()
                )
            );
        });
        
        describe(".output()", () => {
            it("should return a postcss result", () =>
                processor.file(
                    "./packages/core/test/specimens/start.css"
                )
                .then(() => processor.output())
                .then((result) => expect(result.css).toMatchSnapshot())
            );
            
            it("should generate css representing the output from all added files", () =>
                Promise.all([
                    processor.file("./packages/core/test/specimens/start.css"),
                    processor.file("./packages/core/test/specimens/simple.css"),
                ])
                .then(() => processor.output())
                .then((result) => expect(result.css).toMatchSnapshot())
            );

            it("should avoid duplicating files in the output", () =>
                Promise.all([
                    processor.file("./packages/core/test/specimens/start.css"),
                    processor.file("./packages/core/test/specimens/local.css"),
                ])
                .then(() => processor.output())
                .then((result) => expect(result.css).toMatchSnapshot())
            );
            
            it("should generate a JSON structure of all the compositions", () =>
                processor.file(
                    "./packages/core/test/specimens/start.css"
                )
                .then(() => processor.output())
                .then((result) => expect(result.compositions).toMatchSnapshot())
            );
            
            it("should order output by dependencies, then alphabetically", () =>
                Promise.all([
                    processor.file("./packages/core/test/specimens/start.css"),
                    processor.file("./packages/core/test/specimens/local.css"),
                    processor.file("./packages/core/test/specimens/composes.css"),
                    processor.file("./packages/core/test/specimens/deep.css"),
                ])
                .then(() => processor.output())
                .then((result) => expect(result.css).toMatchSnapshot())
            );

            it("should support returning output for specified relative files", () =>
                Promise.all([
                    processor.file("./packages/core/test/specimens/start.css"),
                    processor.file("./packages/core/test/specimens/local.css"),
                ])
                .then(() => processor.output({
                    files : [
                        "./packages/core/test/specimens/start.css",
                    ],
                }))
                .then((result) => expect(result.css).toMatchSnapshot())
            );

            it("should support returning output for specified absolute files", () =>
                Promise.all([
                    processor.file("./packages/core/test/specimens/start.css"),
                    processor.file("./packages/core/test/specimens/local.css"),
                ])
                .then(() => processor.output({
                    files : [
                        require.resolve("./specimens/start.css"),
                    ],
                }))
                .then((result) => expect(result.css).toMatchSnapshot())
            );

            it("should reject if called before input has been processed", () => {
                processor.file(require.resolve("./specimens/start.css"));

                return expect(processor.output()).rejects.toMatchSnapshot();
            });

            it("should allow for seperate source map output", () =>
                processor.file(
                    "./packages/core/test/specimens/start.css"
                )
                .then(() => processor.output({
                    map : {
                        inline : false,
                    },
                }))
                .then((result) => expect(result.map).toMatchSnapshot())
            );
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
