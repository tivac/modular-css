/* eslint consistent-return: off */
"use strict";

const fs = require("fs");
const path = require("path");

const dedent = require("dedent");
const shell  = require("shelljs");

const output = path.resolve(__dirname, "./output/watch");

const read     = require("test-utils/read.js")(output);
const write    = require("test-utils/write.js")(output);
const exists   = require("test-utils/exists.js")(__dirname);
const watching = require("test-utils/rollup-watching.js");

const plugin = require("../rollup.js");

const assetFileNames = "assets/[name][extname]";
const format = "es";
const map = false;

describe("/rollup.js", () => {
    describe("watch mode", () => {
        const { watch } = require("rollup");
        let watcher;
        
        beforeAll(() => shell.rm("-rf", `${output}/*`));
        afterEach(() => watcher.close());
        
        it("should generate output", (done) => {
            // Create v1 of the files
            write(`/change/watched.css`, dedent(`
                .one {
                    color: red;
                }
            `));

            write(`/change/watched.js`, dedent(`
                import css from "./watched.css";
                console.log(css);
            `));

            // Start watching
            watcher = watch({
                input  : `${output}/change/watched.js`,
                output : {
                    file : `${output}/change/watch-output.js`,
                    format,
                    assetFileNames,
                },
                plugins : [
                    plugin({
                        map,
                    }),
                ],
            });

            // Create v2 of the file after a bit
            setTimeout(() => {
                write(`./change/watched.css`, dedent(`
                    .two {
                        color: blue;
                    }
                `));
            }, 200);
            
            watcher.on("event", watching((builds) => {
                if(builds === 1) {
                    expect(read("./change/assets/watch-output.css")).toMatchSnapshot();

                    // continue watching
                    return;
                }

                expect(read("./change/assets/watch-output.css")).toMatchSnapshot();

                return done();
            }));
        });

        it("should correctly update files within the dependency graph", (done) => {
            // Create v1 of the files
            write(`./dep-graph/one.css`, dedent(`
                .one {
                    color: red;
                }
            `));

            write(`./dep-graph/two.css`, dedent(`
                .two {
                    composes: one from "./one.css";
                    
                    color: blue;
                }
            `));
            
            write(`./dep-graph/watch.js`, dedent(`
                import css from "./two.css";
                console.log(css);
            `));

            // Start watching
            watcher = watch({
                input  : require.resolve(path.join(output, "./dep-graph/watch.js")),
                output : {
                    file : `${output}/dep-graph/watch-output.js`,
                    format,
                    assetFileNames,
                },
                plugins : [
                    plugin({
                        map,
                    }),
                ],
            });

            // Create v2 of the file after a bit
            setTimeout(() => {
                write(`./dep-graph/one.css`, dedent(`
                    .one {
                        color: green;
                    }
                `));
            }, 200);
            
            watcher.on("event", watching((builds) => {
                if(builds === 1) {
                    expect(read("dep-graph/assets/watch-output.css")).toMatchSnapshot();

                    // continue watching
                    return;
                }

                expect(read("dep-graph/assets/watch-output.css")).toMatchSnapshot();

                return done();
            }));
        });

        it("should correctly add new css files", (done) => {
            // Create v1 of the files
            write(`./new-file/one.css`, dedent(`
                .one {
                    color: red;
                }
            `));

            write(`./new-file/watch.js`, dedent(`
                console.log("hello");
            `));

            // Start watching
            watcher = watch({
                input  : require.resolve(path.join(output, "./new-file/watch.js")),
                output : {
                    file : `${output}/new-file/watch-output.js`,
                    format,
                    assetFileNames,
                },
                plugins : [
                    plugin({
                        map,
                    }),
                ],
            });

            // Create v2 of the file after a bit
            setTimeout(() => write(`./new-file/watch.js`, dedent(`
                import css from "./one.css";

                console.log(css);
            `)), 200);
            
            watcher.on("event", watching((builds) => {
                if(builds === 1) {
                    expect(exists("./new-file/assets/watch-output.css")).toBe(false);

                    // continue watching
                    return;
                }

                expect(read("./new-file/assets/watch-output.css")).toMatchSnapshot();

                return done();
            }));
        });

        it("should correctly remove & re-add dependencies", (done) => {
            // Create v1 of the files
            write(`./watch-changed/one.css`, dedent(`
                .one {
                    composes: two from "./two.css";
                    color: red;
                }
            `));
            
            write(`./watch-changed/two.css`, dedent(`
                .two {
                    color: red;
                }
            `));

            write(`./watch-changed/watch.js`, dedent(`
                import css from "./one.css";
                console.log("hello");
            `));

            // Start watching
            watcher = watch({
                input  : require.resolve(path.join(output, "./watch-changed/watch.js")),
                output : {
                    file : `${output}/watch-changed/watch-output.js`,
                    format,
                    assetFileNames,
                },
                plugins : [
                    plugin({
                        map,
                    }),
                ],
            });

            // Create v2 of the file after a bit
            setTimeout(() => write(`./watch-changed/two.css`, dedent(`
                .two {
                    color: blue;
                }
            `)), 200);
            
            watcher.on("event", watching((builds) => {
                if(builds === 1) {
                    expect(read("./watch-changed/assets/watch-output.css")).toMatchSnapshot();

                    // continue watching
                    return;
                }

                expect(read("./watch-changed/assets/watch-output.css")).toMatchSnapshot();

                return done();
            }));
        });
    });
});
