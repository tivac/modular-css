"use strict";

var path  = require("path"),
    namer = require("test-utils/namer.js"),

    Processor = require("../processor.js");

function relative(files) {
    return files.map((file) => path.relative(process.cwd(), file));
}

describe("/processor.js", function() {
    describe("Methods", function() {
        var processor;

        beforeEach(function() {
            processor = new Processor({
                namer
            });
        });

        describe(".string()", function() {
            it("should process a string", function() {
                return processor.string(
                    "./simple.css", ".wooga { }"
                )
                .then((result) => {
                    expect(result.exports).toMatchSnapshot();
                    expect(result.details.exports).toMatchSnapshot();
                    expect(result.details.text).toMatchSnapshot();
                    expect(result.details.processed.root.toResult().css).toMatchSnapshot();
                });
            });
        });
        
        describe(".file()", function() {
            it("should process a file", function() {
                return processor.file(
                    "./packages/core/test/specimens/simple.css"
                )
                .then((result) => {
                    expect(result.exports).toMatchSnapshot();
                    expect(result.details.exports).toMatchSnapshot();
                    expect(result.details.text).toMatchSnapshot();
                    expect(result.details.processed.root.toResult().css).toMatchSnapshot();
                });
            });
        });
        
        describe(".remove()", function() {
            it("should remove a file", function() {
                return processor.string(
                    "./simple.css",
                    ".wooga { }"
                )
                .then(() => {
                    processor.remove("./simple.css");
                    
                    expect(relative(processor.dependencies())).toMatchSnapshot();
                });
            });
            
            it("should remove multiple files", function() {
                return Promise.all([
                    processor.string("./a.css", ".aooga { }"),
                    processor.string("./b.css", ".booga { }"),
                    processor.string("./c.css", ".cooga { }")
                ])
                .then(() => {
                    processor.remove([
                        "./a.css",
                        "./b.css"
                    ]);
                    
                    expect(relative(processor.dependencies())).toMatchSnapshot();
                });
            });
        });
        
        describe(".dependencies()", function() {
            it("should return the dependencies of the specified file", function() {
                return processor.file(
                    "./packages/core/test/specimens/start.css"
                )
                .then(() =>
                    expect(
                        relative(processor.dependencies(require.resolve("./specimens/start.css")))
                    )
                    .toMatchSnapshot()
                );
            });
            
            it("should return the overall order of dependencies if no file is specified", function() {
                return processor.file(
                    "./packages/core/test/specimens/start.css"
                )
                .then(() =>
                    expect(relative(processor.dependencies())).toMatchSnapshot()
                );
            });
        });
        
        describe(".output()", function() {
            it("should return a postcss result", function() {
                return processor.file(
                    "./packages/core/test/specimens/start.css"
                )
                .then(() => processor.output())
                .then((result) => expect(result.css).toMatchSnapshot());
            });
            
            it("should generate css representing the output from all added files", function() {
                return Promise.all([
                    processor.file("./packages/core/test/specimens/start.css"),
                    processor.file("./packages/core/test/specimens/simple.css")
                ])
                .then(() => processor.output())
                .then((result) => expect(result.css).toMatchSnapshot());
            });

            it("should avoid duplicating files in the output", function() {
                return Promise.all([
                    processor.file("./packages/core/test/specimens/start.css"),
                    processor.file("./packages/core/test/specimens/local.css")
                ])
                .then(() => processor.output())
                .then((result) => expect(result.css).toMatchSnapshot());
            });
            
            it("should generate a JSON structure of all the compositions", function() {
                return processor.file(
                    "./packages/core/test/specimens/start.css"
                )
                .then(() => processor.output())
                .then((result) => expect(result.compositions).toMatchSnapshot());
            });
            
            it("should order output by dependencies, then alphabetically", function() {
                return Promise.all([
                    processor.file("./packages/core/test/specimens/start.css"),
                    processor.file("./packages/core/test/specimens/local.css"),
                    processor.file("./packages/core/test/specimens/composes.css"),
                    processor.file("./packages/core/test/specimens/deep.css")
                ])
                .then(() => processor.output())
                .then((result) => expect(result.css).toMatchSnapshot());
            });
        });

        describe("._resolve()", function() {
            it("should run resolvers until a match is found", function() {
                var ran = false;

                processor = new Processor({
                    resolvers : [
                        () => {
                            ran = true;
                        },
                        (src, file) => file
                    ]
                });
                
                expect(
                    processor._resolve(
                        "./packages/core/test/specimens/start.css",
                        "./local.css"
                    )
                )
                .toMatchSnapshot();

                expect(ran).toBeTruthy();
            });

            it("should fall back to a default resolver", function() {
                processor = new Processor({
                    resolvers : [
                        () => undefined
                    ]
                });
                
                expect(
                    relative([
                        processor._resolve(
                            "./packages/core/test/specimens/start.css",
                            "./local.css"
                        )
                    ])
                )
                .toMatchSnapshot();
            });
        });
    });
});
