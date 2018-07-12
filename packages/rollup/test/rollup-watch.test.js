/* eslint consistent-return: off */
"use strict";

const dedent = require("dedent");
const shell = require("shelljs");

const read = require("test-utils/read.js")(__dirname);
const write = require("test-utils/write.js")(__dirname);
const exists = require("test-utils/exists.js")(__dirname);
const prefix = require("test-utils/prefix.js")(__dirname);
const watching = require("test-utils/rollup-watching.js");

const plugin = require("../rollup.js");

const assetFileNames = "assets/[name][extname]";
const format = "es";
const map = false;

describe("/rollup.js", () => {
    describe("watch mode", () => {
        const { watch } = require("rollup");
        let watcher;
        
        beforeAll(() => shell.rm("-rf", prefix(`./output/watch/*`)));
        afterEach(() => watcher.close());
        
        it("should generate updated output", (done) => {
            // Create v1 of the files
            write(`./watch/change/watched.css`, dedent(`
                .one {
                    color: red;
                }
            `));

            write(`./watch/change/watched.js`, dedent(`
                import css from "./watched.css";
                console.log(css);
            `));

            // Start watching
            watcher = watch({
                input  : prefix(`./output/watch/change/watched.js`),
                output : {
                    file : prefix(`./output/watch/change/watch-output.js`),
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
                write(`./watch/change/watched.css`, dedent(`
                    .two {
                        color: blue;
                    }
                `));
            }, 200);
            
            watcher.on("event", watching((builds) => {
                if(builds === 1) {
                    expect(read("./watch/change/assets/watch-output.css")).toMatchSnapshot();

                    // continue watching
                    return;
                }

                expect(read("./watch/change/assets/watch-output.css")).toMatchSnapshot();

                return done();
            }));
        });

        it("should generate updated output for composes changes", (done) => {
            // Create v1 of the files
            write(`./watch/change-composes/watched.css`, dedent(`
                .one {
                    color: red;
                }

                .two {
                    composes: one;
                    background: blue;
                }

                .three {
                    color: teal;
                }
            `));

            write(`./watch/change-composes/watched.js`, dedent(`
                import css from "./watched.css";
                console.log(css);
            `));

            // Start watching
            watcher = watch({
                input  : prefix(`./output/watch/change-composes/watched.js`),
                output : {
                    file : prefix(`./output/watch/change-composes/watch-output.js`),
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
                write(`./watch/change-composes/watched.css`, dedent(`
                    .one {
                        color: green;
                    }

                    .two {
                        composes: one;
                        background: blue;
                    }

                    .three {
                        composes: one;
                        color: teal;
                    }
                `));
            }, 200);

            watcher.on("event", watching((builds) => {
                if(builds === 1) {
                    expect(read("./watch/change-composes/assets/watch-output.css")).toMatchSnapshot();
                    expect(read("./watch/change-composes/watch-output.js")).toMatchSnapshot();

                    // continue watching
                    return;
                }

                expect(read("./watch/change-composes/assets/watch-output.css")).toMatchSnapshot();
                expect(read("./watch/change-composes/watch-output.js")).toMatchSnapshot();

                return done();
            }));
        });

        it("should update when a dependency changes", (done) => {
            // Create v1 of the files
            write(`./watch/dep-graph/one.css`, dedent(`
                .one {
                    composes: two from "./two.css";
                    color: red;
                }
            `));

            write(`./watch/dep-graph/two.css`, dedent(`
                .two {
                    color: blue;
                }
            `));
            
            write(`./watch/dep-graph/watch.js`, dedent(`
                import css from "./one.css";
                console.log(css);
            `));

            // Start watching
            watcher = watch({
                input  : require.resolve(prefix("./output/watch/dep-graph/watch.js")),
                output : {
                    file : prefix(`./output/watch/dep-graph/watch-output.js`),
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
                write(`./watch/dep-graph/two.css`, dedent(`
                    .two {
                        color: green;
                    }
                `));
            }, 200);
            
            watcher.on("event", watching((builds) => {
                if(builds === 1) {
                    expect(read("./watch/dep-graph/assets/watch-output.css")).toMatchSnapshot();

                    // continue watching
                    return;
                }

                expect(read("./watch/dep-graph/assets/watch-output.css")).toMatchSnapshot();

                return done();
            }));
        });

        it("should update when adding new css files", (done) => {
            // Create v1 of the files
            write(`./watch/new-file/one.css`, dedent(`
                .one {
                    color: red;
                }
            `));

            write(`./watch/new-file/watch.js`, dedent(`
                console.log("hello");
            `));

            // Start watching
            watcher = watch({
                input  : require.resolve(prefix("./output/watch/new-file/watch.js")),
                output : {
                    file : prefix(`./output/watch/new-file/watch-output.js`),
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
            setTimeout(() => write(`./watch/new-file/watch.js`, dedent(`
                import css from "./one.css";

                console.log(css);
            `)), 200);
            
            watcher.on("event", watching((builds) => {
                if(builds === 1) {
                    expect(exists("./new-file/assets/watch-output.css")).toBe(false);

                    // continue watching
                    return;
                }

                expect(read("./watch/new-file/assets/watch-output.css")).toMatchSnapshot();

                return done();
            }));
        });

        it("should update when a shared dependency changes", (done) => {
            // Create v1 of the files
            write(`./watch/shared-deps/one.css`, dedent(`
                .one {
                    composes: two from "./two.css";
                    color: red;
                }
            `));

            write(`./watch/shared-deps/two.css`, dedent(`
                .two {
                    color: green;
                }
            `));
            
            write(`./watch/shared-deps/three.css`, dedent(`
                .three {
                    composes: two from "./two.css";
                    color: teal;
                }
            `));

            write(`./watch/shared-deps/watch.js`, dedent(`
                import css from "./one.css";
                import css3 from "./three.css";

                console.log(css, css3);
            `));

            // Start watching
            watcher = watch({
                input  : require.resolve(prefix("./output/watch/shared-deps/watch.js")),
                output : {
                    file : prefix(`./output/watch/shared-deps/watch-output.js`),
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
            setTimeout(() => write(`./watch/shared-deps/one.css`, dedent(`
                .one {
                    composes: two from "./two.css";
                    color: blue;
                }
            `)), 200);

            watcher.on("event", watching((builds) => {
                if(builds === 1) {
                    expect(read("./watch/shared-deps/assets/watch-output.css")).toMatchSnapshot();
                    expect(read("./watch/shared-deps/assets/common.css")).toMatchSnapshot();
                    
                    // continue watching
                    return;
                }
                
                expect(read("./watch/shared-deps/assets/watch-output.css")).toMatchSnapshot();
                expect(read("./watch/shared-deps/assets/common.css")).toMatchSnapshot();

                return done();
            }));
        });
    });
});
