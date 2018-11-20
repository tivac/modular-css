"use strict";

const browserify = require("browserify");
const from       = require("from2-string");
const shell      = require("shelljs");
const read = require("@modular-css/test-utils/read.js")(__dirname);
const bundle = require("./lib/bundle.js");
const plugin = require("../browserify.js");

describe("/browserify.js", () => {
    describe("watchify", () => {
        beforeAll(() => shell.mkdir("-p", "./packages/browserify/test/output/watchify"));
        afterEach(() => shell.rm("-rf", "./packages/browserify/test/output/watchify/*"));
        afterAll(() => shell.rm("-rf", "./packages/browserify/test/output/watchify"));
        
        // NOTE: Other watchify tests are in issue files
        it("shouldn't cache file contents between watchify runs", (done) => {
            const build = browserify();
            
            shell.cp("-f",
                "./packages/browserify/test/specimens/simple.css",
                "./packages/browserify/test/output/watchify/watched.css"
            );
            
            build.add(from("require('./packages/browserify/test/output/watchify/watched.css');"));

            build.plugin(require("watchify"));
            build.plugin(plugin, {
                css : "./packages/browserify/test/output/watchify/caching.css",
            });

            // File changed
            build.on("update", () => {
                bundle(build)
                    .then(() => {
                        expect(read("./watchify/caching.css")).toMatchSnapshot();
                        
                        build.close();
                        
                        done();
                    });
            });

            // Run first bundle, start watching
            bundle(build)
                .then(() => {
                    expect(read("./watchify/caching.css")).toMatchSnapshot();

                    shell.cp("-f",
                        "./packages/browserify/test/specimens/blue.css",
                        "./packages/browserify/test/output/watchify/watched.css"
                    );
                });
        });

        it("shouldn't explode on invalid CSS", (done) => {
            const build = browserify();
            let wait;

            shell.cp("-f",
                "./packages/browserify/test/specimens/invalid.css",
                "./packages/browserify/test/output/watchify/watched.css"
            );

            build.add(from("require('./packages/browserify/test/output/watchify/watched.css');"));

            build.plugin(require("watchify"));
            build.plugin(plugin, {
                css : "./packages/browserify/test/output/watchify/errors.css",
            });

            // File changed
            build.on("update", () => {
                // Attempt to bundle again
                bundle(build)
                    .then(() => {
                        expect(read("./watchify/errors.css", "/watchify/errors.css")).toMatchSnapshot();
                        
                        build.close();
                        
                        done();
                    });
            });

            // Run first bundle to start watching
            build.bundle(({ name }) => {
                // This one should fail, but not stop watchify from running
                expect(name).toMatch(/SyntaxError|CssSyntaxError/);
                
                // This might re-trigger before the file has been moved, so
                // guard against moving the file multiple times w/ this check
                if(wait) {
                    return;
                }

                // Wrapped because browserify event lifecycle is... odd
                wait = setTimeout(() => {
                    shell.cp("-f",
                        "./packages/browserify/test/specimens/blue.css",
                        "./packages/browserify/test/output/watchify/watched.css"
                    );
                }, 10);
            });
        });
    });
});
