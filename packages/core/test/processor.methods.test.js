"use strict";

var namer = require("test-utils/namer.js"),

    Processor = require("../processor.js");
    

describe("/processor.js", function() {
    describe("Methods", function() {
        beforeEach(function() {
            this.processor = new Processor({
                cwd : process.cwd(),
                namer
            });
        });

        describe(".string()", function() {
            it("should process a string", function() {
                return this.processor.string(
                    "./simple.css", ".wooga { }"
                )
                .then((result) => {
                    var file = result.files["simple.css"];

                    expect(result.exports).toMatchSnapshot();
                    expect(file.exports).toMatchSnapshot();
                    expect(file.text).toMatchSnapshot();
                    expect(file.processed.root.toResult().css).toMatchSnapshot();
                });
            });
        });
        
        describe(".file()", function() {
            it("should process a file", function() {
                return this.processor.file(
                    "./packages/core/test/specimens/simple.css"
                )
                .then((result) => {
                    var file = result.files["packages/core/test/specimens/simple.css"];
                    
                    expect(result.exports).toMatchSnapshot();
                    expect(file.exports).toMatchSnapshot();
                    expect(file.text).toMatchSnapshot();
                    expect(file.processed.root.toResult().css).toMatchSnapshot();
                });
            });
        });
        
        describe(".remove()", function() {
            it("should remove a file", function() {
                var processor = this.processor;

                return processor.string(
                    "./simple.css",
                    ".wooga { }"
                )
                .then(() => {
                    processor.remove("./simple.css");
                    
                    expect(processor.dependencies()).toMatchSnapshot();
                });
            });
            
            it("should remove multiple files", function() {
                var processor = this.processor;
                
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
                    
                    expect(processor.dependencies()).toMatchSnapshot();
                });
            });
        });
        
        describe(".dependencies()", function() {
            it("should return the dependencies of the specified file", function() {
                var processor = this.processor;

                return processor.file(
                    "./packages/core/test/specimens/start.css"
                )
                .then(() =>
                    expect(
                        processor.dependencies("packages/core/test/specimens/start.css")
                    )
                    .toMatchSnapshot()
                );
            });
            
            it("should return the overall order of dependencies if no file is specified", function() {
                var processor = this.processor;

                return processor.file(
                    "./packages/core/test/specimens/start.css"
                )
                .then(() => expect(processor.dependencies()).toMatchSnapshot());
            });
        });
        
        describe(".output()", function() {
            it("should return a postcss result", function() {
                var processor = this.processor;

                return processor.file(
                    "./packages/core/test/specimens/start.css"
                )
                .then(() => processor.output())
                .then((result) => expect(result.css).toMatchSnapshot());
            });
            
            it("should generate css representing the output from all added files", function() {
                var processor = this.processor;

                return Promise.all([
                    processor.file("./packages/core/test/specimens/start.css"),
                    processor.file("./packages/core/test/specimens/simple.css")
                ])
                .then(() => processor.output())
                .then((result) => expect(result.css).toMatchSnapshot());
            });

            it("should avoid duplicating files in the output", function() {
                var processor = this.processor;

                return Promise.all([
                    processor.file("./packages/core/test/specimens/start.css"),
                    processor.file("./packages/core/test/specimens/local.css")
                ])
                .then(() => processor.output())
                .then((result) => expect(result.css).toMatchSnapshot());
            });
            
            it("should generate a JSON structure of all the compositions", function() {
                var processor = this.processor;

                return processor.file(
                    "./packages/core/test/specimens/start.css"
                )
                .then(() => processor.output())
                .then((result) => expect(result.compositions).toMatchSnapshot());
            });
            
            it("should order output by dependencies, then alphabetically", function() {
                var processor = this.processor;
                
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
                var ran = false,

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
                var processor = new Processor({
                        resolvers : [
                            () => undefined
                        ]
                    });
                
                expect(
                    processor._resolve(
                        "./packages/core/test/specimens/start.css",
                        "./local.css"
                    )
                )
                .toMatchSnapshot();
            });
        });
    });
});
