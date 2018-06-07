"use strict";

const fs = require("fs");

const rollup  = require("rollup").rollup;

const read     = require("test-utils/read.js")(__dirname);
const namer    = require("test-utils/namer.js");
const watching = require("test-utils/rollup-watching.js");

const processor = require("../rollup.js");

function cleanup(code) {
    return code.replace(/\/\* packages.*$/gm, "");
}

const assetFileNames = "assets/[name][extname]";
const format = "es";
const map = false;
const sourcemap = false;

const output = "./packages/svelte/test/output";

describe("/rollup.js", () => {
    // afterEach(() => require("shelljs").rm("-rf", `${output}/*`);
    
    it("should generate exports", () => {
        const { preprocess, plugin } = processor({
            css : `${output}/svelte.css`,
            namer,
        });

        return rollup({
            input   : require.resolve("./specimens/style.html"),
            plugins : [
                require("rollup-plugin-svelte")({
                    preprocess
                }),
                plugin
            ]
        })
        .then((bundle) => bundle.write({
            format,
            assetFileNames,
            sourcemap,
            
            file : `${output}/svelte.js`
        }))
        .then(() => {
            expect(cleanup(read("svelte.js"))).toMatchSnapshot();
            expect(read("svelte.css")).toMatchSnapshot();
        });
    });

    it("should not generate exports", () => {
        const { preprocess, plugin } = processor({
            namer,
        });

        return rollup({
            input   : require.resolve("./specimens/style.html"),
            plugins : [
                require("rollup-plugin-svelte")({
                    preprocess
                }),
                plugin
            ]
        })
        .then((bundle) => bundle.write({
            format,
            assetFileNames,
            sourcemap,
            
            file : `${output}/svelte.js`
        }))
        .then(() => {
            expect(() => read("svelte.css")).toThrow();
        });
    });

    it("should support external css w/o a <script>", async () => {
        const { preprocess, plugin } = processor({
            namer,
            map,
        });

        const bundle = await rollup({
            input   : require.resolve("./specimens/external.html"),
            plugins : [
                require("rollup-plugin-svelte")({
                    preprocess
                }),
                plugin
            ]
        });

        await bundle.write({
            format,
            assetFileNames,
            sourcemap,
            
            file : `${output}/svelte.js`
            
        });

        expect(cleanup(read("svelte.js"))).toMatchSnapshot();
        expect(read("assets/svelte.css")).toMatchSnapshot();
    });

    it("should support external css w/ a script", async () => {
        const { preprocess, plugin } = processor({
            namer,
            map,
        });

        const bundle = await rollup({
            input   : require.resolve("./specimens/external-script.html"),
            plugins : [
                require("rollup-plugin-svelte")({
                    preprocess
                }),
                
                plugin
            ]
        });

        await bundle.write({
            format,
            assetFileNames,
            sourcemap,
            
            file : `${output}/svelte.js`
        });

        expect(cleanup(read("svelte.js"))).toMatchSnapshot();
        expect(read("assets/svelte.css")).toMatchSnapshot();
    });

    describe("rollup watcher", () => {
        const watch = require("rollup").watch;
        let watcher;

        afterEach(() => watcher.close());

        it("should support file changes when using watch", (done) => {
            const { preprocess, plugin } = processor({
                namer,
                map,
            });

            // Create HTML
            fs.writeFileSync(
                `${output}/watch.html`,
                `<link rel="stylesheet" href="./watched.css" />`
            );

            // Create v1 of the file
            fs.writeFileSync(
                `${output}/watched.css`,
                ".one { color: red; }"
            );

            // Start watching
            watcher = watch({
                input  : require.resolve("./output/watch.html"),
                output : {
                    file : `${output}/watch-output.js`,
                    format,
                    assetFileNames,
                },
                plugins : [
                    require("rollup-plugin-svelte")({
                        preprocess
                    }),
                    plugin
                ]
            });

            // Create v2 of the file after a bit
            setTimeout(() => fs.writeFileSync(
                "./packages/rollup/test/output/watched.css",
                ".two { color: blue; }"
            ), 200);
            
            watcher.on("event", watching((builds) => {
                console.log(builds);
                
                if(builds === 1) {
                    console.log(read("watch-output.js"));

                    expect(read("assets/watch-output.css")).toMatchSnapshot();

                    // continue watching
                    return null;
                }

                expect(read("assets/watch-output.css")).toMatchSnapshot();

                return done();
            }));
        });
    });
});
