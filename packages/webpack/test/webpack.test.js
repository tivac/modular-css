/* eslint-disable max-statements */
"use strict";

const fs   = require("fs");
const path = require("path");

const webpack = require("webpack");
const shell   = require("shelljs");
const dedent  = require("dedent");

const read  = require("test-utils/read.js")(__dirname);
const namer = require("test-utils/namer.js");

const Processor = require("modular-css-core");

const Plugin = require("../plugin.js");

const output = path.resolve(__dirname, "./output");
const loader = require.resolve("../loader.js");
const test   = /\.css$/;

function success(err, stats) {
    expect(err).toBeFalsy();
    if(stats.hasErrors()) {
        throw stats.toJson().errors[0];
    }
}

function config({ entry, use, plugin, watch = false }) {
    return {
        entry,
        watch,

        mode        : "development",
        recordsPath : path.join(__dirname, "./records", `${path.basename(entry)}.json`),
        output      : {
            path     : output,
            filename : "./output.js",
        },
        module : {
            rules : [
                {
                    test,
                    use : use ? use : loader,
                },
            ],
        },
        plugins : [
            new Plugin(Object.assign({
                namer,
                css : "./output.css",
            }, plugin)),
        ],
    };
}

describe("/webpack.js", () => {
    afterEach(() => shell.rm("-rf", "./packages/webpack/test/output/*"));

    it("should be a function", () => {
        expect(typeof Plugin).toBe("function");
    });

    it("should output css to disk", (done) => {
        webpack(config({
            entry : "./packages/webpack/test/specimens/simple.js",
        }), (err, stats) => {
            success(err, stats);

            expect(read("output.js")).toMatchSnapshot();
            expect(read("output.css")).toMatchSnapshot();

            done();
        });
    });

    it("should output json to disk", (done) => {
        webpack(config({
            entry  : "./packages/webpack/test/specimens/simple.js",
            plugin : {
                json : "./output.json",
            },
        }), (err, stats) => {
            success(err, stats);

            expect(read("output.js")).toMatchSnapshot();
            expect(read("output.json")).toMatchSnapshot();

            done();
        });
    });

    it("should output inline source maps", (done) => {
        webpack(config({
            entry  : "./packages/webpack/test/specimens/simple.js",
            plugin : {
                map : true,
            },
        }), (err, stats) => {
            success(err, stats);

            expect(read("output.css")).toMatchSnapshot();

            done();
        });
    });

    it("should output external source maps to disk", (done) => {
        webpack(config({
            entry  : "./packages/webpack/test/specimens/simple.js",
            plugin : {
                map : {
                        inline : false,
                    },
                },
        }), (err, stats) => {
            success(err, stats);

            expect(read("output.css.map")).toMatchSnapshot();

            done();
        });
    });

    it("should report errors", (done) => {
        webpack(config({
            entry : "./packages/webpack/test/specimens/invalid.js",
        }), (err, stats) => {
            expect(stats.hasErrors()).toBeTruthy();

            expect(stats.toJson().errors[0]).toMatch("Invalid composes reference");

            done();
        });
    });

    it("should report warnings on invalid property names", (done) => {
        webpack(config({
            entry : "./packages/webpack/test/specimens/invalid-name.js",
        }), (err, stats) => {
            expect(stats.hasWarnings()).toBeTruthy();

            expect(stats.toJson().warnings[0]).toMatch("Invalid JS identifier");

            done();
        });
    });

    it("should handle dependencies", (done) => {
        webpack(config({
            entry  : "./packages/webpack/test/specimens/start.js",
            plugin : {
                    json : "./output.json",
                },
        }), (err, stats) => {
            success(err, stats);

            expect(read("output.js")).toMatchSnapshot();
            expect(read("output.css")).toMatchSnapshot();
            expect(read("output.json")).toMatchSnapshot();

            done();
        });
    });

    it("should support ES2015 default exports", (done) => {
        webpack(config({
            entry : "./packages/webpack/test/specimens/es2015-default.js",
        }), (err, stats) => {
            success(err, stats);

            expect(read("output.js")).toMatchSnapshot();
            expect(read("output.css")).toMatchSnapshot();

            done();
        });
    });

    it("should support ES2015 named exports", (done) => {
        webpack(config({
            entry : "./packages/webpack/test/specimens/es2015-named.js",
        }), (err, stats) => {
            success(err, stats);

            expect(read("output.js")).toMatchSnapshot();
            expect(read("output.css")).toMatchSnapshot();

            done();
        });
    });

    it("should support disabling namedExports when the option is set", (done) => {
        webpack(config({
            entry : "./packages/webpack/test/specimens/simple.js",
            use   : {
                loader,
                options : {
                    namedExports : false,
                },
            },
        }), (err, stats) => {
            success(err, stats);

            expect(read("output.js")).toMatchSnapshot();

            done();
        });
    });

    it("should generate correct builds in watch mode when files change", (done) => {
        var changed = 0,
            compiler, watcher;

        // Create v1 of the file
        fs.writeFileSync(
            path.join(__dirname, "./output/watched.css"),
            ".one { color: red; }"
        );

        compiler = webpack(config({
            entry : require.resolve("./specimens/watch.js"),
            watch : true,
        }));

        compiler.plugin("watch-close", () => {
            // setTimeout is to give webpack time to shut down correctly
            // w/o it the build freezes forever!
            setTimeout(done, 50);
        });

        watcher = compiler.watch(null, (err, stats) => {
            changed++;

            success(err, stats);

            expect(read("output.js")).toMatchSnapshot();
            expect(read("output.css")).toMatchSnapshot();

            if(changed < 2) {
                return fs.writeFileSync(
                    path.join(__dirname, "./output/watched.css"),
                    ".two { color: blue; }"
                );
            }

            return watcher.close();
        });
    });

    it("should generate correct builds when files change", () => {
        var changed = "./packages/webpack/test/output/changed.css",
            compiler;

        // wrap compiler.run in a promise for easier chaining
        function run() {
            return new Promise((resolve, reject) =>
                compiler.run((err, stats) => {
                    if(stats.hasErrors()) {
                        return reject(stats);
                    }

                    expect(read("output.js")).toMatchSnapshot();
                    expect(read("output.css")).toMatchSnapshot();

                    return resolve(stats);
                })
            );
        }

        compiler = webpack(config({
            entry : "./packages/webpack/test/specimens/change.js",
        }));

        // Create v1 of the file
        fs.writeFileSync(changed, ".one { color: red; }");

        // Run webpack the first time
        return run()
            .then(() => {
                // v2 of the file
                fs.writeFileSync(changed, ".two { color: blue; }");

                return run();
            })
            .then(() => {
                fs.unlinkSync(changed);

                return run();
            })
            // This build fails because the file is missing
            .catch((stats) => {
                expect(stats.toJson().errors[0]).toMatch("no such file or directory");

                fs.writeFileSync(changed, ".three { color: green; }");

                return run();
            });
    });

    it("should accept an existing processor instance", async (done) => {
        const processor = new Processor();

        await processor.string("./packages/webpack/test/specimens/fake.css", dedent(`
            .fake {
                color: yellow;
            }
        `));

        webpack(config({
            entry  : "./packages/webpack/test/specimens/simple.js",
            plugin : {
                processor,
            },
        }), (err, stats) => {
            success(err, stats);

            expect(read("output.js")).toMatchSnapshot();
            expect(read("output.css")).toMatchSnapshot();

            done();
        });
    });
});
