"use strict";

const fs     = require("fs");
const assert = require("assert");
const dedent     = require("dedent");
const browserify = require("browserify");
const from       = require("from2-string");
const shell      = require("shelljs");
const read   = require("@modular-css/test-utils/read.js")(__dirname);
const prefix = require("@modular-css/test-utils/prefix.js")(__dirname);
const bundle = require("./lib/bundle.js");
const plugin = require("../browserify.js");

describe("/browserify.js", () => {
    describe("factor-bundle", () => {
        beforeAll(() => shell.mkdir("./packages/browserify/test/output/factor-bundle"));
        afterAll(() => shell.rm("-rf", "./packages/browserify/test/output/factor-bundle"));
        
        it("should be supported", async () => {
            const build = browserify([
                    from(dedent(`
                        require('./packages/browserify/test/specimens/factor-bundle/basic/common.js');
                        require('./packages/browserify/test/specimens/start.css');
                    `)),
                    from(dedent(`
                        require('./packages/browserify/test/specimens/factor-bundle/basic/common.js');
                        require('./packages/browserify/test/specimens/local.css');
                    `)),
                ]);
            
            build.plugin(plugin, {
                css : prefix("output/factor-bundle/basic/basic.css"),
            });

            build.plugin(require("factor-bundle"), {
                outputs : [
                    prefix("output/factor-bundle/basic-a.js"),
                    prefix("output/factor-bundle/basic-b.js"),
                ],
            });
            
            const out = await bundle(build);
                
            expect(out).toMatchSnapshot();
            expect(read("./factor-bundle/basic/basic.css")).toMatchSnapshot();
            expect(read("./factor-bundle/basic/_stream_0.css")).toMatchSnapshot();
        });
        
        it("should support files w/o commonalities", async () => {
            const build = browserify([
                    from(dedent(`
                        require('./packages/browserify/test/specimens/simple.css');
                    `)),
                    from(dedent(`
                        require('./packages/browserify/test/specimens/blue.css');
                    `)),
                ]);
            
            build.plugin(plugin, {
                css : prefix("output/factor-bundle/nocommon/nocommon.css"),
            });

            build.plugin(require("factor-bundle"), {
                outputs : [
                    prefix("output/factor-bundle/nocommon-a.js"),
                    prefix("output/factor-bundle/nocommon-b.js"),
                ],
            });
            
            await bundle(build);

            expect(read("./factor-bundle/nocommon/_stream_0.css")).toMatchSnapshot();
            expect(read("./factor-bundle/nocommon/_stream_1.css")).toMatchSnapshot();
        });
        
        it("should properly handle files w/o dependencies", async () => {
            const build = browserify([
                    prefix("specimens/factor-bundle/deps/a.js"),
                    prefix("specimens/factor-bundle/deps/b.js"),
                ]);
            
            build.plugin(plugin, {
                css : prefix("output/factor-bundle/deps/deps.css"),
            });

            build.plugin(require("factor-bundle"), {
                outputs : [
                    prefix("output/factor-bundle/deps-a.js"),
                    prefix("output/factor-bundle/deps-b.js"),
                ],
            });
            
            await bundle(build);

            expect(read("./factor-bundle/deps/deps.css")).toMatchSnapshot();
            expect(read("./factor-bundle/deps/a.css")).toMatchSnapshot();
        });

        it("should support relative paths within factor-bundle files", async () => {
            const build = browserify([
                    prefix("specimens/factor-bundle/relative/a.js"),
                    prefix("specimens/factor-bundle/relative/b.js"),
                ]);
            
            build.plugin(plugin, {
                css : prefix("output/factor-bundle/relative/relative.css"),
            });

            build.plugin(require("factor-bundle"), {
                outputs : [
                    prefix("output/factor-bundle/relative-a.js"),
                    prefix("output/factor-bundle/relative-b.js"),
                ],
            });
            
            await bundle(build);

            expect(read("./factor-bundle/relative/relative.css")).toMatchSnapshot();
            expect(read("./factor-bundle/relative/a.css")).toMatchSnapshot();
        });

        it("should avoid outputting empty css files by default", async () => {
            const build = browserify([
                    prefix("specimens/factor-bundle/noempty/a.js"),
                    prefix("specimens/factor-bundle/noempty/b.js"),
                ]);
            
            build.plugin(plugin, {
                css : prefix("output/factor-bundle/noempty/noempty.css"),
            });

            build.plugin(require("factor-bundle"), {
                outputs : [
                    prefix("output/factor-bundle/noempty-a.js"),
                    prefix("output/factor-bundle/noempty-b.js"),
                ],
            });
            
            await bundle(build);

            assert.throws(() => {
                fs.statSync(prefix("output/factor-bundle/noempty/b.css"));
            });
                    
            expect(read("./factor-bundle/noempty/noempty.css")).toMatchSnapshot();
            expect(read("./factor-bundle/noempty/a.css")).toMatchSnapshot();
        });

        it("should output empty css files when asked", async () => {
            const build = browserify([
                    prefix("specimens/factor-bundle/empty/a.js"),
                    prefix("specimens/factor-bundle/empty/b.js"),
                ]);
            
            build.plugin(plugin, {
                css   : prefix("output/factor-bundle/empty/empty.css"),
                empty : true,
            });

            build.plugin(require("factor-bundle"), {
                outputs : [
                    prefix("output/factor-bundle/empty-a.js"),
                    prefix("output/factor-bundle/empty-b.js"),
                ],
            });
            
            await bundle(build);

            expect(read("./factor-bundle/empty/empty.css")).toMatchSnapshot();
            expect(read("./factor-bundle/empty/a.css")).toMatchSnapshot();
        });
    });
});
