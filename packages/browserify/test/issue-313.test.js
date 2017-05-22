"use strict";

var fs = require("fs"),
    
    browserify = require("browserify"),
    from       = require("from2-string"),
    
    read = require("test-utils/read.js")(__dirname),

    bundle = require("./lib/bundle.js"),
    plugin = require("../browserify.js");

describe("/browserify.js", function() {
    describe("/issues", function() {
        describe("/313", function() {
            it("should include all dependencies after watchify update", function(done) {
                var src = from("require('./packages/browserify/test/specimens/issues/313/1.css');require('./packages/browserify/test/specimens/issues/313/2.css');"),
                    opts = { cache: {}, packageCache: {} },
                    
                    build = browserify(src, opts);

                build.plugin("watchify");
                build.plugin(plugin, {
                    css : "./packages/browserify/test/output/issues/313.css"
                });

                var expectedOutput;

                // File changed
                build.on("update", function() {
                    bundle(build)
                        .then(() => {
                            // expect(read("./issues/313.css")).toMatchSnapshot();

                            // compare the output of the updated file with the initial bundle
                            expect(read("./issues/313.css")).toEqual(expectedOutput);

                            build.close();
                            
                            done();
                        });
                });

                // Run first bundle, start watching
                bundle(build)
                    .then(() => {
                        // save the output of the first build
                        expectedOutput = read("./issues/313.css");

                        expect(expectedOutput).toMatchSnapshot();
                        
                        // Trigger a rebuild
                        fs.utimesSync("./packages/browserify/test/specimens/issues/313/2.css", new Date(), new Date());
                    });
            });
        });
    });
});
