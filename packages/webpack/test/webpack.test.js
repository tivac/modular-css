"use strict";

const fs   = require("fs");
const path = require("path");

const webpack = require("webpack");
const dedent  = require("dedent");
const shell   = require("shelljs");

const read  = require("@modular-css/test-utils/read.js")(__dirname);
const namer = require("@modular-css/test-utils/namer.js");

const Processor = require("@modular-css/processor");

const Plugin = require("../plugin.js");

const context = path.resolve(__dirname, "../../../");

const output = path.resolve(__dirname, "./output");
const loader = require.resolve("../loader.js");
const test   = /\.css$/;

const success = (err, stats) => {
    expect(err).toBeFalsy();

    if(stats.hasErrors()) {
        throw stats.toJson().errors[0];
    }
};

const config = ({ entry, use, plugin, watch = false }) => ({
    entry : path.resolve(context, entry),
    watch,
    context,

    mode        : "development",
    devtool     : false,
    recordsPath : path.join(__dirname, "./records", `${path.basename(entry)}.json`),
    
    output : {
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
});

describe("/webpack.js", () => {
    afterEach(() => shell.rm("-rf", "./packages/webpack/test/output/*"));

    it("should be a function", () => {
        expect(typeof Plugin).toBe("function");
    });

    it("should output css to disk", () => new Promise((done) => {
        webpack(config({
            entry : "./packages/webpack/test/specimens/simple.js",
        }), (err, stats) => {
            success(err, stats);

            expect(read("output.js")).toMatchSnapshot();
            expect(read("output.css")).toMatchSnapshot();

            done();
        });
    }));

    it("should output json to disk", () => new Promise((done) => {
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
    }));

    it("should output inline source maps", () => new Promise((done) => {
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
    }));

    it("should output external source maps to disk", () => new Promise((done) => {
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
    }));

    it("should report modular-css errors", () => new Promise((done) => {
        webpack(config({
            entry : "./packages/webpack/test/specimens/invalid.js",
        }), (err, stats) => {
            expect(stats.hasErrors()).toBe(true);
            expect(stats.toJson().errors[0].message).toMatch("Invalid composes reference");

            done();
        });
    }));
    
    it("should report postcss errors", () => new Promise((done) => {
        webpack(config({
            entry : "./packages/webpack/test/specimens/parse-error.js",
        }), (err, stats) => {
            expect(stats.hasErrors()).toBe(true);
            expect(stats.toJson().errors[0].message).toMatch("Unexpected '/'");

            done();
        });
    }));

    it("should report warnings on invalid property names", () => new Promise((done) => {
        webpack(config({
            entry : "./packages/webpack/test/specimens/invalid-name.js",
        }), (err, stats) => {
            expect(stats.hasWarnings()).toBeTruthy();

            expect(stats.toJson().warnings[0].details).toMatch("is not a valid JS identifier");

            done();
        });
    }));

    it("should handle dependencies", () => new Promise((done) => {
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
    }));

    it("should support ES2015 default exports", () => new Promise((done) => {
        webpack(config({
            entry : "./packages/webpack/test/specimens/es2015-default.js",
        }), (err, stats) => {
            success(err, stats);

            expect(read("output.js")).toMatchSnapshot();
            expect(read("output.css")).toMatchSnapshot();

            done();
        });
    }));

    it("should support ES2015 named exports", () => new Promise((done) => {
        webpack(config({
            entry : "./packages/webpack/test/specimens/es2015-named.js",
        }), (err, stats) => {
            success(err, stats);

            expect(read("output.js")).toMatchSnapshot();
            expect(read("output.css")).toMatchSnapshot();

            done();
        });
    }));

    it("should generate correct builds in watch mode when files change", () => new Promise((resolve) => {
        let changed = 0;

        // Create v1 of the file
        fs.writeFileSync(
            path.join(__dirname, "./output/watched.css"),
            ".one { color: red; }"
        );

        const compiler = webpack(config({
            entry : require.resolve("./specimens/watch.js"),
        }));

        const watcher = compiler.watch(null, (err, stats) => {
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

            watcher.close();

            return resolve();
        });
    }));

    it("should not throw in watch mode when non-css files change", () => new Promise((resolve) => {
        let changed = 0;

        // Create v1 of the file
        fs.writeFileSync(
            path.join(__dirname, "./output/watch.js"),
            ""
        );

        const compiler = webpack(config({
            entry : require.resolve("./output/watch.js"),
        }));

        expect(() => {
            const watcher = compiler.watch(null, (err, stats) => {
                changed++;
    
                success(err, stats);

                if(changed < 2) {
                    return fs.writeFileSync(
                        path.join(__dirname, "./output/watch.js"),
                        "console.log('changed')"
                    );
                }
    
                watcher.close();
    
                return resolve();
            });
        }).not.toThrow();
    }));

    // TODO: How on earth do I get webpack to tell me what files changed?
    // eslint-disable-next-line jest/no-disabled-tests -- I dunno
    it.skip("should generate correct builds when files change", () => {
        const changed = "./packages/webpack/test/output/changed.css";

        // eslint-disable-next-line prefer-const -- need to be able to write to it
        let compiler;

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
                // eslint-disable-next-line jest/no-conditional-expect -- just deal jest
                expect(stats.toJson().errors[0].message).toMatch("Error: Can't resolve '../output/changed.css'");

                fs.writeFileSync(changed, ".three { color: green; }");

                return run();
            });
    });

    it("should accept an existing processor instance", async () => {
        const processor = new Processor();

        await processor.string("./packages/webpack/test/specimens/fake.css", dedent(`
            .fake {
                color: yellow;
            }
        `));

        return new Promise((resolve) => {
            webpack(config({
                entry  : "./packages/webpack/test/specimens/simple.js",
                plugin : {
                    processor,
                },
            }), (err, stats) => {
                success(err, stats);

                expect(read("output.js")).toMatchSnapshot();
                expect(read("output.css")).toMatchSnapshot();

                resolve();
            });
        });
    });
});
