/* eslint consistent-return: off */
"use strict";

const shell = require("shelljs");
const importer = require("postcss-import");

const write = require("@modular-css/test-utils/write.js")(__dirname);
const prefix = require("@modular-css/test-utils/prefix.js")(__dirname);
const dir = require("@modular-css/test-utils/read-dir.js")(__dirname);
const namer   = require("@modular-css/test-utils/namer.js");
const watching = require("@modular-css/test-utils/rollup-watching.js");

const plugin = require("../rollup.js");

const assetFileNames = "assets/[name][extname]";
const format = "es";
const map = false;

describe("/rollup.js watch mode", () => {
    const { watch } = require("rollup");

    const createPlugin = (opts = {}) => plugin({
        namer,
        map,
        ...opts,
    });

    let watcher;

    beforeAll(() => shell.rm("-rf", prefix(`./output/watch/*`)));
    afterEach(() => watcher.close());

    it("should generate updated output", async () => {
        // Create v1 of the files
        write(`./watch/change/watched.css`, `
            .one {
                color: red;
            }
        `);

        write(`./watch/change/watched.js`, `
            import css from "./watched.css";
            console.log(css);
        `);

        // Start watching
        watcher = watch({
            input  : prefix(`./output/watch/change/watched.js`),

            output : {
                file : prefix(`./output/watch/change/output/output.js`),
                format,
                assetFileNames,
            },

            plugins : [
                createPlugin(),
            ],
        });

        const wait = watching.promise(watcher);

        await wait();

        const v1 = dir("./watch/change/output/");

        setTimeout(() => write(`./watch/change/watched.css`, `
            .two {
                color: blue;
            }
        `), 100);

        await wait();

        const v2 = dir("./watch/change/output/");

        expect(v1).toMatchDiffSnapshot(v2);
    });

    it("should generate updated output for composes changes", async () => {
        // Create v1 of the files
        write(`./watch/change-composes/watched.css`, `
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
        `);

        write(`./watch/change-composes/watched.js`, `
            import css from "./watched.css";
            console.log(css);
        `);

        // Start watching
        watcher = watch({
            input  : prefix(`./output/watch/change-composes/watched.js`),

            output : {
                file : prefix(`./output/watch/change-composes/output/output.js`),
                format,
                assetFileNames,
            },

            plugins : [
                createPlugin(),
            ],
        });

        const wait = watching.promise(watcher);

        await wait();

        const v1 = dir("./watch/change-composes/output/");

        setTimeout(() => write(`./watch/change-composes/watched.css`, `
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
        `), 100);

        await wait();

        const v2 = dir("./watch/change-composes/output/");

        expect(v1).toMatchDiffSnapshot(v2);
    });

    it("should update when a dependency changes", async () => {
        // Create v1 of the files
        write(`./watch/dep-graph/one.css`, `
            .one {
                composes: two from "./two.css";
                composes: three from "./three.css";
                color: red;
            }
        `);

        write(`./watch/dep-graph/two.css`, `
            .two {
                color: blue;
            }
        `);

        write(`./watch/dep-graph/three.css`, `
            .three {
                color: green;
            }
        `);

        write(`./watch/dep-graph/watch.js`, `
            import css from "./one.css";
            console.log(css);
        `);

        // Start watching
        watcher = watch({
            input  : require.resolve(prefix("./output/watch/dep-graph/watch.js")),

            output : {
                file : prefix(`./output/watch/dep-graph/output/output.js`),
                format,
                assetFileNames,
            },

            plugins : [
                createPlugin(),
            ],
        });

        const wait = watching.promise(watcher);

        await wait();

        const v1 = dir("./watch/dep-graph/output/");

        setTimeout(() => write(`./watch/dep-graph/two.css`, `
            .two {
                color: green;
            }
        `), 100);

        await wait();

        const v2 = dir("./watch/dep-graph/output/");

        expect(v1).toMatchDiffSnapshot(v2);
    });

    it("should update when adding new css files", async () => {
        // Create v1 of the files
        write(`./watch/new-file/one.css`, `
            .one {
                color: red;
            }
        `);

        write(`./watch/new-file/watch.js`, `
            console.log("hello");
        `);

        // Start watching
        watcher = watch({
            input  : require.resolve(prefix("./output/watch/new-file/watch.js")),

            output : {
                file : prefix(`./output/watch/new-file/output/output.js`),
                format,
                assetFileNames,
            },

            plugins : [
                createPlugin(),
            ],
        });

        const wait = watching.promise(watcher);

        await wait();

        const v1 = dir("./watch/new-file/output/");

        setTimeout(() => write(`./watch/new-file/watch.js`, `
            import css from "./one.css";

            console.log(css);
        `), 100);

        await wait();

        const v2 = dir("./watch/new-file/output");

        expect(v1).toMatchDiffSnapshot(v2);
    });

    it("should update when a shared dependency changes", async () => {
        // Create v1 of the files
        write(`./watch/shared-deps/one.css`, `
            .one {
                composes: two from "./two.css";
                color: red;
            }
        `);

        write(`./watch/shared-deps/two.css`, `
            .two {
                color: green;
            }
        `);

        write(`./watch/shared-deps/three.css`, `
            .three {
                composes: two from "./two.css";
                color: teal;
            }
        `);

        write(`./watch/shared-deps/watch.js`, `
            import css from "./one.css";
            import css3 from "./three.css";

            console.log(css, css3);
        `);

        // Start watching
        watcher = watch({
            input  : require.resolve(prefix("./output/watch/shared-deps/watch.js")),

            output : {
                file : prefix(`./output/watch/shared-deps/output/output.js`),
                format,
                assetFileNames,
            },

            plugins : [
                createPlugin(),
            ],
        });

        const wait = watching.promise(watcher);

        await wait();

        const v1 = dir("./watch/shared-deps/output");

        setTimeout(() => write(`./watch/shared-deps/two.css`, `
            .two {
                color: yellow;
            }
        `), 100);

        await wait();

        const v2 = dir("./watch/shared-deps/output");

        expect(v1).toMatchDiffSnapshot(v2);
    });

    it("should update when a shared @value changes", async () => {
        // Create v1 of the files
        write(`./watch/shared-deps/one.css`, `
            @value baloo from "./values.css";
            .one {
                color: baloo;
            }
        `);

        write(`./watch/shared-deps/values.css`, `
            @value baloo: blue;
        `);

        write(`./watch/shared-deps/watch.js`, `
            import css from "./one.css";

            console.log(css);
        `);

        // Start watching
        watcher = watch({
            input  : require.resolve(prefix("./output/watch/shared-deps/watch.js")),

            output : {
                file : prefix(`./output/watch/shared-deps/output/output.js`),
                format,
                assetFileNames,
            },

            plugins : [
                createPlugin(),
            ],
        });

        const wait = watching.promise(watcher);

        await wait();

        const v1 = dir("./watch/shared-deps/output");

        setTimeout(() => write(`./watch/shared-deps/values.css`, `
            @value baloo: red;
        `), 100);

        await wait();

        const v2 = dir("./watch/shared-deps/output");

        expect(v1).toMatchDiffSnapshot(v2);
    });

    it("should watch when using code splitting", async () => {
        // Create v1 of the files
        write(`./watch/code-splitting/one.css`, `
            .one {
                composes: shared from "./shared.css";
                color: red;
            }
        `);

        write(`./watch/code-splitting/two.css`, `
            .two {
                color: green;
            }
        `);

        write(`./watch/code-splitting/shared.css`, `
            .shared {
                color: blue;
            }
        `);

        write(`./watch/code-splitting/one.js`, `
            import css from "./one.css";

            console.log(css);
        `);

        write(`./watch/code-splitting/two.js`, `
            import two from "./two.css";
            import "./shared.css";

            console.log(css);
        `);

        // Start watching
        watcher = watch({
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
                createPlugin(),
            ],
        });

        const wait = watching.promise(watcher);

        await wait();


        const v1 = dir("./watch/code-splitting/output");

        setTimeout(() => write(`./watch/code-splitting/shared.css`, `
            .shared {
                color: seafoam;
            }
        `), 100);

        await wait();

        const v2 = dir("./watch/code-splitting/output");

        expect(v1).toMatchDiffSnapshot(v2);
    });

    it.only("should watch files added via other plugins", async () => {
        // Create v1 of the files
        write(`./watch/deps/one.css`, `
            @import "./imported.css";

            .one { color: red; }
        `);

        write(`./watch/deps/imported.css`, `
            .two { color: green; }
        `);

        write(`./watch/deps/one.js`, `
            import css from "./one.css";

            console.log(css);
        `);

        // Start watching
        watcher = watch({
            input : [
                require.resolve(prefix("./output/watch/deps/one.js")),
            ],

            output : {
                dir : prefix(`./output/watch/deps/output`),
                format,
                assetFileNames,
            },

            plugins : [
                createPlugin({
                    processing : [ importer() ],
                }),
            ],
        });

        const wait = watching.promise(watcher);

        await wait();


        const v1 = dir("./watch/deps/output");

        setTimeout(() => write(`./watch/deps/imported.css`, `
            .two { color: seafoam; }
        `), 100);

        await wait();

        const v2 = dir("./watch/deps/output");

        expect(v1).toMatchDiffSnapshot(v2);
    });
});
