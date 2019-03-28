/* eslint consistent-return: off */
"use strict";

const dedent = require("dedent");
const shell = require("shelljs");
const diff = require("snapshot-diff");

const write = require("@modular-css/test-utils/write.js")(__dirname);
const prefix = require("@modular-css/test-utils/prefix.js")(__dirname);
const dir = require("@modular-css/test-utils/read-dir.js")(__dirname);
const watching = require("@modular-css/test-utils/rollup-watching.js");

const plugin = require("../svelte.js");

const assetFileNames = "assets/[name][extname]";
const format = "es";

describe("/svelte.js", () => {
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
            write(`./rollup/input/index.js`, dedent(`
                import app from "./app.html";
                console.log(app);
            `));

            write(`./rollup/input/app.html`, dedent(`
                <div class="{css.nope}">Hi</div>
            `));

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
                        write(`./rollup/input/app.css`, dedent(`
                            .nope {
                                color: blue;
                            }
                        `));

                        write(`./rollup/input/app.html`, dedent(`
                            <link rel="stylesheet" href="./app.css" />
                            <div class="{css.nope}">Hi</div>
                        `));
                    }, 100);

                    // continue watching
                    return;
                }

                v2 = dir("./rollup/output/");

                expect(v1).toMatchDiffSnapshot(v2);

                return done();
            }));
        });
    });
});
