const { describe, it, beforeEach } = require("node:test");

const postcss = require("postcss");
const dedent = require("dedent");

const namer = require("@modular-css/test-utils/namer.js");
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

        it("should be a function", (t) => {
            t.assert.strictEqual(typeof Processor, "function");
        });

        describe(".root()", () => {
            it("should process a postcss Root", async (t) => {
                const file = "./simple.css";
                const root = postcss.parse(".wooga { }", { from : file });
                const { exports : compositions, details } = await processor.root(file, root);

                t.assert.snapshot(compositions);
                t.assert.snapshot(details.classes);
                t.assert.snapshot(details.processed.root.toResult().css);
            });
        });

        describe(".string()", () => {
            it("should process a string", async (t) => {
                const { exports : compositions, details } = await processor.string("./simple.css", ".wooga { }");

                t.assert.snapshot(compositions);
                t.assert.snapshot(details.classes);
                t.assert.snapshot(details.processed.root.toResult().css);
            });
        });

        describe(".file()", () => {
            it("should process a relative file", async (t) => {
                const { exports : compositions, details } = await processor.file(
                    "./packages/processor/test/specimens/simple.css"
                );

                t.assert.snapshot(compositions);
                t.assert.snapshot(details.classes);
                t.assert.snapshot(details.processed.root.toResult().css);
            });

            it("should process an absolute file", async (t) => {
                const { exports : compositions, details } = await processor.file(
                    require.resolve("./specimens/simple.css")
                );

                t.assert.snapshot(compositions);
                t.assert.snapshot(details.classes);
                t.assert.snapshot(details.processed.root.toResult().css);
            });

            it("should wait for dependencies to be processed before composing", async (t) => {
                const results = await Promise.all([
                    processor.file(require.resolve("./specimens/overlapping/entry1.css")),
                    processor.file(require.resolve("./specimens/overlapping/entry2.css")),
                ]);

                t.assert.snapshot(results.map((result) => result.exports));
            });
        });

        describe(".has()", () => {
            it("should return a boolean", async (t) => {
                await processor.string(
                    "./simple.css",
                    ".wooga { }"
                );

                t.assert.strictEqual(processor.has("./simple.css"), true);
                t.assert.strictEqual(processor.has("./nope.css"), false);
            });

            it("should normalize inputs before checking for existence", async (t) => {
                await processor.string(
                    "./simple.css",
                    ".wooga { }"
                );

                t.assert.strictEqual(processor.has("../modular-css/simple.css"), true);
            });
        });

        describe(".normalize()", () => {
            it("should normalize inputs", async (t) => {
                t.assert.snapshot(relative([ processor.normalize("../modular-css/simple.css") ]));
            });
        });

        describe(".remove()", () => {
            it("should remove a relative file", async (t) => {
                await processor.string(
                    "./simple.css",
                    ".wooga { }"
                );

                processor.remove("./simple.css");

                t.assert.snapshot(relative(processor.fileDependencies()));
            });

            it("should remove an absolute file", async (t) => {
                await processor.string(
                    "./packages/processor/test/specimens/simple.css",
                    ".wooga { }"
                );

                processor.remove(require.resolve("./specimens/simple.css"));

                t.assert.snapshot(relative(processor.fileDependencies()));
            });

            it("should remove multiple files", async (t) => {
                await processor.string("./a.css", ".a { }");
                await processor.string("./b.css", ".b { }");
                await processor.string("./c.css", ".c { }");

                processor.remove([
                    "./a.css",
                    "./b.css",
                ]);

                t.assert.snapshot(relative(processor.fileDependencies()));
            });

            it("should return an array of removed files", async (t) => {
                await processor.string("./a.css", ".a { }");
                await processor.string("./b.css", ".b { }");
                await processor.string("./c.css", ".c { }");

                t.assert.snapshot(
                    relative(
                        processor.remove([
                            "./a.css",
                            "./b.css",
                        ])
                    )
                );
            });
        });

        describe(".invalidate()", () => {
            const status = (source) =>
                Object.entries(source).map(([ key, value ]) =>
                    ([ relative([ key ])[0], value.valid ])
                );

            it("should invalidate a relative file", async (t) => {
                await processor.string(
                    "./simple.css",
                    ".wooga { }"
                );

                processor.invalidate("./simple.css");

                t.assert.snapshot(status(processor.files));
            });

            it("should invalidate an absolute file", async (t) => {
                await processor.string(
                    "./packages/processor/test/specimens/simple.css",
                    ".wooga { }"
                );

                processor.invalidate(require.resolve("./specimens/simple.css"));

                t.assert.snapshot(status(processor.files));
            });

            it("should throw if no file is passed", async (t) => {
                await processor.file("./packages/processor/test/specimens/start.css");

                try {
                    processor.invalidate();
                } catch(e) {
                    t.assert.snapshot(e.toString());
                }
            });

            it("should throw if an invalid file is passed", async (t) => {
                await processor.file("./packages/processor/test/specimens/start.css");

                t.assert.rejects(
                    async () => processor.invalidate("nope.css"),
                    /Unknown file: .+\bnope.css/,
                );
            });

            it("should invalidate all dependents as well", async (t) => {
                await processor.file("./packages/processor/test/specimens/start.css");

                processor.invalidate("./packages/processor/test/specimens/folder/folder.css");

                t.assert.snapshot(status(processor.files));
            });

            it("should reprocess invalidated files", async (t) => {
                await processor.file("./packages/processor/test/specimens/start.css");

                processor.invalidate("./packages/processor/test/specimens/start.css");

                await processor.file("./packages/processor/test/specimens/start.css");

                t.assert.snapshot(status(processor.files));
            });
        });

        describe(".fileDependencies()", () => {
            it("should return the dependencies of the specified file", async (t) => {
                await processor.file("./packages/processor/test/specimens/start.css");

                t.assert.snapshot(
                    relative(processor.fileDependencies(require.resolve("./specimens/start.css")))
                );
            });

            it("should return the overall order of dependencies if no file is specified", async (t) => {
                await processor.file("./packages/processor/test/specimens/start.css");

                t.assert.snapshot(relative(processor.fileDependencies()));
            });

            it("should throw on requesting an invalid file", async (t) => {
                await processor.string("./does/not/exist.css", dedent(`
                    .foo {
                        color: red;
                    }
                `));

                await t.assert.rejects(
                    async () => processor.fileDependencies("./also/does/not/exist.css"),
                    "Unknown file: "
                );
            });
        });

        describe(".fileDependents()", () => {
            it("should return the dependencies of the specified file", async (t) => {
                await processor.file("./packages/processor/test/specimens/start.css");

                t.assert.snapshot(
                    relative(processor.fileDependents(require.resolve("./specimens/local.css")))
                );
            });

            it("should throw if no file is specified", async (t) => {
                await processor.file("./packages/processor/test/specimens/start.css");

                await t.assert.rejects(
                    async () => processor.fileDependents(),
                    "must be called with a file"
                );
            });

            it("should throw on requesting an invalid file", async (t) => {
                await processor.string("./does/not/exist.css", dedent(`
                    .foo {
                        color: red;
                    }
                `));

                await t.assert.rejects(
                    async () => processor.fileDependents("./also/does/not/exist.css"),
                    "Unknown file: "
                );
            });
        });

        describe(".output()", () => {
            it("should reject unknown files", async (t) => {
                await t.assert.rejects(
                    async () => processor.output({
                        files : [
                            "./not/a/real/file",
                        ],
                    }),
                    "Unknown file requested",
                );
            });

            it("should return a postcss result", async (t) => {
                await processor.file("./packages/processor/test/specimens/start.css");

                const result = await processor.output();

                t.assert.snapshot(result.css);
            });

            it("should generate css representing the output from all added files", async (t) => {
                await processor.file("./packages/processor/test/specimens/start.css");
                await processor.file("./packages/processor/test/specimens/simple.css");

                const result = await processor.output();

                t.assert.snapshot(result.css);
            });

            it("should avoid duplicating files in the output", async (t) => {
                await processor.file("./packages/processor/test/specimens/start.css");
                await processor.file("./packages/processor/test/specimens/local.css");

                const result = await processor.output();

                t.assert.snapshot(result.css);
            });

            it("should generate a JSON structure of all the compositions", async (t) => {
                await processor.file("./packages/processor/test/specimens/start.css");

                const result = await processor.output();

                t.assert.snapshot(result.compositions);
            });

            it("should order output by dependencies, then alphabetically", async (t) => {
                await processor.file("./packages/processor/test/specimens/start.css");
                await processor.file("./packages/processor/test/specimens/local.css");
                await processor.file("./packages/processor/test/specimens/composes/external-composes-multiple-declarations.css");
                await processor.file("./packages/processor/test/specimens/deep.css");

                const result = await processor.output();

                t.assert.snapshot(result.css);
            });

            it("should support returning output for specified relative files", async (t) => {
                await processor.file("./packages/processor/test/specimens/start.css");
                await processor.file("./packages/processor/test/specimens/local.css");

                const result = await processor.output({
                    files : [
                        "./packages/processor/test/specimens/start.css",
                    ],
                });

                t.assert.snapshot(result.css);
            });

            it("should support returning output for specified absolute files", async (t) => {
                await processor.file("./packages/processor/test/specimens/start.css");
                await processor.file("./packages/processor/test/specimens/local.css");

                const result = await processor.output({
                    files : [
                        require.resolve("./specimens/start.css"),
                    ],
                });

                t.assert.snapshot(result.css);
            });

            it("should allow for seperate source map output", async (t) => {
                await processor.file("./packages/processor/test/specimens/start.css");

                const result = await processor.output({
                    map : {
                        inline : false,
                    },
                });

                t.assert.snapshot(result.map);
            });
        });

        describe(".warnings", () => {
            it("should have warnings from files that have been added", async (t) => {
                await processor.file("./packages/processor/test/specimens/warnings.css");

                t.assert.ok(processor.warnings.length > 0);
                t.assert.snapshot(processor.warnings.map((warning) => warning.text));
            });

            [
                "before",
                "processing",
                "after",
                "done",
            ].forEach((hook) => {
                it(`should expose warnings from ${hook} hook`, async (t) => {
                    processor = new Processor({
                        [hook] : [{
                            postcssPlugin : `${hook}-warnings`,
                            Rule(rule, { result }) {
                                rule.warn(result, `This is a warning from ${hook} plugin`);
                            },
                        }],
                    });

                    await processor.file("./packages/processor/test/specimens/simple.css");

                    await processor.output();

                    t.assert.snapshot(processor.warnings[[ 0 ]], {
                        serializers : [ (warning) => {
                            warning.node = false;

                            return JSON.stringify(warning, null, 2);
                        } ],
                    });
                });
            });
        });

        describe(".compositions", () => {
            it("should return compositions for loaded files", async (t) => {
                await processor.file(require.resolve("./specimens/start.css"));

                t.assert.snapshot(processor.compositions);
            });
        });

        describe(".resolve()", () => {
            it("should run resolvers until a match is found", (t) => {
                let ran = false;

                processor = new Processor({
                    resolvers : [
                        () => {
                            ran = true;
                        },
                    ],
                });

                t.assert.snapshot(
                    relative([
                        processor.resolve(
                            require.resolve("./specimens/start.css"),
                            "./local.css"
                        ),
                    ])
                );

                t.assert.ok(ran);
            });

            it("should fall back to a default resolver", (t) => {
                processor = new Processor({
                    resolvers : [
                        () => undefined,
                    ],
                });

                t.assert.snapshot(
                    relative([
                        processor.resolve(
                            require.resolve("./specimens/start.css"),
                            "./local.css"
                        ),
                    ])
                );
            });
        });
    });
});
