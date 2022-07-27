"use strict";

const fs = require("fs");
const browserify = require("browserify");
const from       = require("from2-string");
const dedent     = require("dedent");
const read = require("@modular-css/test-utils/read.js")(__dirname);
const bundle = require("./lib/bundle.js");
const plugin = require("../browserify.js");

describe("/browserify.js", () => {
    describe("/issues", () => {
        describe("/313", () => {
            // eslint-disable-next-line jest/no-done-callback -- how it has to be
            it("should include all dependencies after watchify update", (done) => {
                const build = browserify(
                        from(dedent(`
                            require("./packages/browserify/test/specimens/issues/313/1.css");
                            require("./packages/browserify/test/specimens/issues/313/2.css");
                        `)),
                        {
                            cache        : {},
                            packageCache : {},
                        }
                    );

                let css;

                build.plugin(require("watchify"));
                build.plugin(plugin, {
                    css : "./packages/browserify/test/output/issues/313.css",
                });

                // File changed
                build.on("update", () => {
                    bundle(build)
                        .then(() => {
                            // compare the output of the updated file with the initial bundle
                            expect(read("./issues/313.css")).toEqual(css);

                            build.close();
                            
                            done();
                        });
                });

                // Run first bundle, start watching
                bundle(build)
                    .then(() => {
                        // save the output of the first build
                        css = read("./issues/313.css");

                        expect(css).toMatchSnapshot();
                        
                        // Trigger a rebuild
                        fs.utimesSync(
                            "./packages/browserify/test/specimens/issues/313/2.css",
                            new Date(),
                            new Date()
                        );
                    });
            });
        });
    });
});
