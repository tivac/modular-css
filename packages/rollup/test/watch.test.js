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
                    file : prefix(`./output/watch/change/output/output.js`),
                    format,
                    assetFileNames,
                },
                plugins : [
                    plugin({
                        map,
                    }),
                ],
            });

            let v1;
            let v2;

            watcher.on("event", watching((builds) => {
                if(builds === 1) {
                    v1 = dir("./watch/change/output/");

                    setTimeout(() => write(`./watch/change/watched.css`, dedent(`
                        .two {
                            color: blue;
                        }
                    `)), 100);

                    // continue watching
                    return;
                }

                v2 = dir("./watch/change/output/");

                expect(v1).toMatchDiffSnapshot(v2);

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
                    file : prefix(`./output/watch/change-composes/output/output.js`),
                    format,
                    assetFileNames,
                },
                plugins : [
                    plugin({
                        map,
                    }),
                ],
            });

            let v1;
            let v2;

            watcher.on("event", watching((builds) => {
                if(builds === 1) {
                    v1 = dir("./watch/change-composes/output/");

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

                v2 = dir("./watch/change-composes/output/");

                expect(v1).toMatchDiffSnapshot(v2);

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
                    file : prefix(`./output/watch/dep-graph/output/output.js`),
                    format,
                    assetFileNames,
                },
                plugins : [
                    plugin({
                        map,
                    }),
                ],
            });

            let v1;
            let v2;

            watcher.on("event", watching((builds) => {
                if(builds === 1) {
                    v1 = dir("./watch/dep-graph/output/");

                    setTimeout(() => write(`./watch/dep-graph/two.css`, dedent(`
                        .two {
                            color: green;
                        }
                    `)), 100);

                    // continue watching
                    return;
                }

                v2 = dir("./watch/dep-graph/output/");

                expect(v1).toMatchDiffSnapshot(v2);

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
                    file : prefix(`./output/watch/new-file/output/output.js`),
                    format,
                    assetFileNames,
                },
                plugins : [
                    plugin({
                        map,
                    }),
                ],
            });

            let v1;
            let v2;

            watcher.on("event", watching((builds) => {
                if(builds === 1) {
                    v1 = dir("./watch/new-file/output/");

                    setTimeout(() => write(`./watch/new-file/watch.js`, dedent(`
                        import css from "./one.css";

                        console.log(css);
                    `)), 100);

                    // continue watching
                    return;
                }

                v2 = dir("./watch/new-file/output");

                expect(v1).toMatchDiffSnapshot(v2);

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
                    file : prefix(`./output/watch/shared-deps/output/output.js`),
                    format,
                    assetFileNames,
                },
                plugins : [
                    plugin({
                        map,
                    }),
                ],
            });

            let v1;
            let v2;

            watcher.on("event", watching((builds) => {
                if(builds === 1) {
                    v1 = dir("./watch/shared-deps/output");
                    
                    setTimeout(() => write(`./watch/shared-deps/two.css`, dedent(`
                        .two {
                            color: yellow;
                        }
                    `)), 100);

                    // continue watching
                    return;
                }
                
                v2 = dir("./watch/shared-deps/output");

                expect(v1).toMatchDiffSnapshot(v2);

                return done();
            }));
        });

        it("should update when a shared @value changes", (done) => {
            // Create v1 of the files
            write(`./watch/shared-deps/one.css`, dedent(`
                @value baloo from "./values.css";
                .one {
                    color: baloo;
                }
            `));

            write(`./watch/shared-deps/values.css`, dedent(`
                @value baloo: blue;
            `));

            write(`./watch/shared-deps/watch.js`, dedent(`
                import css from "./one.css";

                console.log(css);
            `));

            // Start watching
            watcher = watch({
                input  : require.resolve(prefix("./output/watch/shared-deps/watch.js")),
                output : {
                    file : prefix(`./output/watch/shared-deps/output/output.js`),
                    format,
                    assetFileNames,
                },
                plugins : [
                    plugin({
                        map,
                    }),
                ],
            });

            let v1;
            let v2;

            watcher.on("event", watching((builds) => {
                if(builds === 1) {
                    v1 = dir("./watch/shared-deps/output");
                    
                    setTimeout(() => write(`./watch/shared-deps/values.css`, dedent(`
                        @value baloo: red;
                    `)), 100);

                    // continue watching
                    return;
                }
                
                v2 = dir("./watch/shared-deps/output");

                expect(v1).toMatchDiffSnapshot(v2);

                return done();
            }));
        });
        
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
                .shared {
                    color: blue;
                }
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
                    dir : prefix(`./output/watch/code-splitting/output`),
                    format,
                    assetFileNames,
                },
                
                plugins : [
                    plugin({
                        map,
                    }),
                ],
            });

            let v1;
            let v2;

            watcher.on("event", watching((builds) => {
                if(builds === 1) {
                    v1 = dir("./watch/code-splitting/output");
                    
                    // Create v2 of the file we want to change
                    setTimeout(() => write(`./watch/code-splitting/shared.css`, dedent(`
                        .shared {
                            color: seafoam;
                        } 
                    `)), 100);
                    
                    // continue watching
                    return;
                }
                
                v2 = dir("./watch/code-splitting/output");

                expect(v1).toMatchDiffSnapshot(v2);

                return done();
            }));
        });
    });
});
