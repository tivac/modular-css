/* eslint consistent-return: off */
"use strict";

const path = require("path");

const shell = require("shelljs");
const { rollup } = require("rollup");

const write = require("@modular-css/test-utils/write.js")(__dirname);
const prefix = require("@modular-css/test-utils/prefix.js")(__dirname);
const dir = require("@modular-css/test-utils/read-dir.js")(__dirname);
const watching = require("@modular-css/test-utils/rollup-watching.js");

const plugin = require("../svelte.js");

const assetFileNames = "assets/[name][extname]";
const format = "es";

describe("/svelte.js", () => {
    let warnSpy;

    beforeEach(() => {
        warnSpy = jest.spyOn(global.console, "warn");
        warnSpy.mockImplementation(() => { /* NO-OP */ });
    });

    describe("rollup watching", () => {
        const { watch } = require("rollup");
        let watcher;

        beforeAll(() => shell.rm("-rf", prefix(`./output/rollup/*`)));
        afterEach(() => watcher.close());

        it("should generate updated output", (done) => {
            const { preprocess, processor } = plugin();

            let v1;
            let v2;

            // Create v1 of the files
            write(`./rollup/input/index.js`, `
                import app from "./app.html";
                console.log(app);
            `);

            write(`./rollup/input/app.html`, `
                <div class="{css.nope}">Hi</div>
            `);

            // Start watching
            watcher = watch({
                input  : prefix(`./output/rollup/input/index.js`),
                output : {
                    file : prefix(`./output/rollup/output/output.js`),
                    format,
                    assetFileNames,
                },
                plugins : [
                    require("rollup-plugin-svelte")({
                        preprocess,
                    }),
                    require("@modular-css/rollup")({
                        processor,
                    }),
                ],
            });

            watcher.on("event", watching((builds) => {
                if(builds === 1) {
                    v1 = dir("./rollup/output/");

                    setTimeout(() => {
                        write(`./rollup/input/app.css`, `
                            .nope {
                                color: blue;
                            }
                        `);

                        write(`./rollup/input/app.html`, `
                            <link rel="stylesheet" href="./app.css" />
                            <div class="{css.nope}">Hi</div>
                        `);
                    }, 100);

                    // continue watching
                    return;
                }

                v2 = dir("./rollup/output/");

                expect(v1).toMatchDiffSnapshot(v2, {
                    // Get specific to avoid some travis-related weirdness
                    contextLines     : 0,
                    stablePatchmarks : true,
                });

                return done();
            }));
        });

        it("should generate updated output when composition changes", (done) => {
            const { preprocess, processor } = plugin();

            let v1;
            let v2;

            // Create v1 of the files
            write(`./rollup-composes/input/index.js`, `
                import app from "./app.html";
                console.log(app);
            `);

            write(`./rollup-composes/input/app.html`, `
                <link rel="stylesheet" href="./app.css" />
                <div class="{css.a}">Hi</div>
            `);

            write(`./rollup-composes/input/app.css`, `
                .a {
                    composes: b from "./other.css";

                    color: red;
                }
            `);
            
            write(`./rollup-composes/input/other.css`, `
                .b {
                    background: blue;
                }

                .c {
                    background: green;
                }
            `);

            // Start watching
            watcher = watch({
                input  : prefix(`./output/rollup-composes/input/index.js`),
                output : {
                    file : prefix(`./output/rollup-composes/output/output.js`),
                    format,
                    assetFileNames,
                },
                plugins : [
                    require("rollup-plugin-svelte")({
                        preprocess,
                    }),
                    require("@modular-css/rollup")({
                        processor,
                    }),
                ],
            });

            watcher.on("event", watching((builds) => {
                if(builds === 1) {
                    v1 = dir("./rollup-composes/output/");

                    setTimeout(() => {
                        write(`./rollup-composes/input/app.css`, `
                            .a {
                                composes: c from "./other.css";
                                
                                color: red;
                            }
                        `);
                    }, 100);

                    // continue watching
                    return;
                }

                v2 = dir("./rollup-composes/output/");

                expect(v1).toMatchDiffSnapshot(v2);

                return done();
            }));
        });
    });

    describe("rollup errors", () => {
        it.each([[ "link" ], [ "style" ]])(
            "should show useful errors from rollup (<%s>)",
            async (type) => {
                const { preprocess, processor } = plugin();

                try {
                    await rollup({
                        input : "./error.js",

                        plugins : [
                            require("rollup-plugin-hypothetical")({
                                cwd   : path.join(__dirname, "./specimens"),
                                files : {
                                    "./error.js" : `
                                        import Component from "./error-${type}.html";

                                        console.log(Component);
                                    `
                                },

                                allowFallthrough : true,
                            }),
                            require("rollup-plugin-svelte")({
                                preprocess,
                            }),
                            require("@modular-css/rollup")({
                                processor,
                            }),
                        ]
                    });
                } catch(e) {
                    expect(e.toString()).toMatch(/\.wooga/);
                }
            }
        );
    });
});
