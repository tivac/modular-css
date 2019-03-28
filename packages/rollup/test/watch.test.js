/* eslint consistent-return: off */
"use strict";

const dedent = require("dedent");
const shell = require("shelljs");

const write = require("@modular-css/test-utils/write.js")(__dirname);
const prefix = require("@modular-css/test-utils/prefix.js")(__dirname);
const dir = require("@modular-css/test-utils/read-dir.js")(__dirname);
const watching = require("@modular-css/test-utils/rollup-watching.js");

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

            watcher.on("event", watching((builds) => {
                if(builds === 1) {
                    expect(dir("./watch/change/assets/")).toMatchSnapshot();

                    setTimeout(() => write(`./watch/change/watched.css`, dedent(`
                        .two {
                            color: blue;
                        }
                    `)), 100);

                    // continue watching
                    return;
                }

                expect(dir("./watch/change/assets/")).toMatchSnapshot();

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

            watcher.on("event", watching((builds) => {
                if(builds === 1) {
                    expect(dir("./watch/change-composes/")).toMatchSnapshot();

                    setTimeout(() => write(`./watch/change-composes/watched.css`, dedent(`
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
                    `)), 100);

                    // continue watching
                    return;
                }

                expect(dir("./watch/change-composes/")).toMatchSnapshot();

                return done();
            }));
        });

        it("should update when a dependency changes", (done) => {
            // Create v1 of the files
            write(`./watch/dep-graph/one.css`, dedent(`
                .one {
                    composes: two from "./two.css";
                    composes: three from "./three.css";
                    color: red;
                }
            `));

            write(`./watch/dep-graph/two.css`, dedent(`
                .two {
                    color: blue;
                }
            `));
            
            write(`./watch/dep-graph/three.css`, dedent(`
                .three {
                    color: green;
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

            watcher.on("event", watching((builds) => {
                if(builds === 1) {
                    expect(dir("./watch/dep-graph/assets/")).toMatchSnapshot();

                    setTimeout(() => write(`./watch/dep-graph/two.css`, dedent(`
                        .two {
                            color: green;
                        }
                    `)), 100);

                    // continue watching
                    return;
                }

                expect(dir("./watch/dep-graph/assets/")).toMatchSnapshot();

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

            watcher.on("event", watching((builds) => {
                if(builds === 1) {
                    expect(dir("./new-file/assets/")).toMatchSnapshot();

                    setTimeout(() => write(`./watch/new-file/watch.js`, dedent(`
                        import css from "./one.css";

                        console.log(css);
                    `)), 100);

                    // continue watching
                    return;
                }

                expect(dir("./watch/new-file/assets/")).toMatchSnapshot();

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

            watcher.on("event", watching((builds) => {
                if(builds === 1) {
                    expect(dir("./watch/shared-deps/assets/")).toMatchSnapshot();
                    
                    setTimeout(() => write(`./watch/shared-deps/two.css`, dedent(`
                        .two {
                            color: yellow;
                        }
                    `)), 100);

                    // continue watching
                    return;
                }
                
                expect(dir("./watch/shared-deps/assets/")).toMatchSnapshot();

                return done();
            }));
        });
        
        // TODO: causing jest to hang but say the test has completed weirdly
        it("should watch when using code splitting", (done) => {
            // Create v1 of the files
            write(`./watch/code-splitting/one.css`, dedent(`
                .one {
                    composes: shared from "./shared.css";
                    color: red;
                }
            `));

            write(`./watch/code-splitting/two.css`, dedent(`
                .two {
                    color: green;
                }
            `));
            
            write(`./watch/code-splitting/shared.css`, dedent(`
                @value baloo from "./values.css";

                .shared {
                    color: baloo;
                }
            `));
            
            write(`./watch/code-splitting/values.css`, dedent(`
                @value baloo: blue;
            `));
            
            write(`./watch/code-splitting/one.js`, dedent(`
                import css from "./one.css";

                console.log(css);
            `));
            
            write(`./watch/code-splitting/two.js`, dedent(`
                import two from "./two.css";
                import "./shared.css";

                console.log(css);
            `));

            // Start watching
            watcher = watch({
                experimentalCodeSplitting : true,

                input : [
                    require.resolve(prefix("./output/watch/code-splitting/one.js")),
                    require.resolve(prefix("./output/watch/code-splitting/two.js")),
                ],

                output : {
                    dir : prefix(`./output/watch/code-splitting`),
                    format,
                    assetFileNames,
                },
                
                plugins : [
                    plugin({
                        map,
                    }),
                ],
            });

            watcher.on("event", watching((builds) => {
                if(builds === 1) {
                    expect(dir("./watch/code-splitting/assets/")).toMatchSnapshot();
                    
                    // Create v2 of the file we want to change
                    setTimeout(() => write(`./watch/code-splitting/values.css`, dedent(`
                    @value baloo: aqua;
                    `)), 100);
                    
                    // continue watching
                    return;
                }
                
                expect(dir("./watch/code-splitting/assets/")).toMatchSnapshot();

                return done();
            }));
        });
    });
});
