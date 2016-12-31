"use strict";

var fs     = require("fs"),
    path   = require("path"),
    assert = require("assert"),

    browserify = require("browserify"),
    from       = require("from2-string"),
    mkdirp     = require("mkdirp"),
    rimraf     = require("rimraf"),
    shell      = require("shelljs"),

    plugin = require("../src/browserify"),

    bundle  = require("./lib/bundle"),
    compare = require("./lib/compare-files");

describe("/browserify.js", function() {
    describe("basic functionality", function() {
        afterAll(function(done) {
            rimraf("./test/output/browserify", done);
        });

        it("should not error if no options are supplied", function() {
            var build = browserify();

            build.on("error", function() {
                assert.fail();
            });

            build.plugin(plugin);
        });

        it("should error if an invalid extension is applied", function(done) {
            var build = browserify();

            build.on("error", function(err) {
                assert.equal(err, "Missing or invalid \"ext\" option: false");

                done();
            });

            build.plugin(plugin, { ext : false });
        });

        it("should error on invalid CSS", function(done) {
            var build  = browserify({
                    entries : from("require('./test/specimens/invalid.css');")
                }),
                errors = 0;

            build.plugin(plugin);

            build.bundle(function(err) {
                ++errors;

                assert(err);

                if(errors === 1) {
                    assert.equal(err.name, "CssSyntaxError");
                    assert.equal(err.reason, "Invalid composes reference");

                    return false;
                }

                return done();
            });
        });

        it("should replace require() calls with the exported identifiers", function(done) {
            var build = browserify({
                    entries : from("require('./test/specimens/simple.css');")
                });

            build.plugin(plugin);

            bundle(build, function(out) {
                assert(
                    out.indexOf(fs.readFileSync("./test/results/browserify/export-identifiers.js", "utf8")) > -1
                );

                done();
            });
        });

        it("should correctly rewrite urls based on the destination file", function(done) {
            var build = browserify({
                    entries : from("require('./test/specimens/relative.css');")
                });

            build.plugin(plugin, {
                css : "./test/output/browserify/relative.css"
            });

            bundle(build, function() {
                compare.results("browserify/relative.css");

                done();
            });
        });

        it("should use the specified namer function", function(done) {
            var build = browserify({
                    entries : from("require('./test/specimens/keyframes.css');")
                });

            build.plugin(plugin, {
                css   : "./test/output/browserify/namer-fn.css",
                namer : function(file, selector) {
                    return path.basename(file, path.extname(file)) + "-" + selector;
                }
            });

            bundle(build, function() {
                compare.results("browserify/namer-fn.css");

                done();
            });
        });

        it("should include all CSS dependencies in output css", function(done) {
            var build = browserify({
                    entries : from("require('./test/specimens/start.css');")
                });

            build.plugin(plugin, { css : "./test/output/browserify/include-css-deps.css" });

            bundle(build, function(out) {
                compare.contains(out, "browserify/include-css-deps.js");

                compare.results("browserify/include-css-deps.css");

                done();
            });
        });

        it("should write out the complete exported identifiers when `json` is specified", function(done) {
            var build = browserify(from("require('./test/specimens/multiple.css');"));

            build.plugin(plugin, {
                json : "./test/output/browserify/export-all-identifiers.json"
            });

            bundle(build, function() {
                assert.equal(
                    fs.readFileSync("./test/output/browserify/export-all-identifiers.json", "utf8"),
                    JSON.stringify({
                        "test/specimens/multiple.css" : {
                            fooga : "mcdc9e477f_fooga",
                            wooga : "mcdc9e477f_fooga mcdc9e477f_wooga"
                        }
                    }, null, 4)
                );

                done();
            });
        });

        it("should not include duplicate files in the output multiple times", function(done) {
            var build = browserify(
                    from("require('./test/specimens/start.css'); require('./test/specimens/local.css');")
                );

            build.plugin(plugin, { css : "./test/output/browserify/avoid-duplicates.css" });

            bundle(build, function(out) {
                compare.contains(out, "browserify/avoid-duplicates-local.js");
                compare.contains(out, "browserify/avoid-duplicates-start.js");

                compare.results("browserify/avoid-duplicates.css");

                done();
            });
        });

        it("should output an inline source map when the debug option is specified", function(done) {
            var build = browserify({
                    debug   : true,
                    entries : from("require('./test/specimens/start.css');")
                });

            build.plugin(plugin, { css : "./test/output/browserify/source-maps.css" });

            bundle(build, function() {
                var css = fs.readFileSync("./test/output/browserify/source-maps.css", "utf8");

                assert(
                    css.indexOf("/*# sourceMappingURL=data:application/json;base64," > -1)
                );

                done();
            });
        });
    });

    describe("factor-bundle", function() {
        afterAll(function(done) {
            rimraf("./test/output/factor-bundle", done);
        });

        it("should be supported", function(done) {
            var build = browserify([
                    from("require('./test/specimens/factor-bundle/basic/common.js'); require('./test/specimens/start.css');"),
                    from("require('./test/specimens/factor-bundle/basic/common.js'); require('./test/specimens/local.css');")
                ]);

            mkdirp.sync("./test/output/factor-bundle/basic");

            build.plugin(plugin, {
                css : "./test/output/factor-bundle/basic/basic.css"
            });

            build.plugin("factor-bundle", {
                outputs : [
                    "./test/output/factor-bundle/basic/a.js",
                    "./test/output/factor-bundle/basic/b.js"
                ]
            });

            bundle(build, function(out) {
                fs.writeFileSync("./test/output/factor-bundle/basic/common.js", out);

                compare.results("/factor-bundle/basic/basic.css");
                compare.results("/factor-bundle/basic/_stream_0.css");

                done();
            });
        });

        it("should support files w/o commonalities", function(done) {
            var build = browserify([
                    from("require('./test/specimens/simple.css');"),
                    from("require('./test/specimens/blue.css');")
                ]);

            mkdirp.sync("./test/output/factor-bundle/nocommon");

            build.plugin(plugin, {
                css : "./test/output/factor-bundle/nocommon/nocommon.css"
            });

            build.plugin("factor-bundle", {
                outputs : [
                    "./test/output/factor-bundle/nocommon/a.js",
                    "./test/output/factor-bundle/nocommon/b.js"
                ]
            });

            bundle(build, function() {
                compare.results("/factor-bundle/nocommon/_stream_0.css");
                compare.results("/factor-bundle/nocommon/_stream_1.css");

                done();
            });
        });

        it("should properly handle files w/o dependencies", function(done) {
            var build = browserify([
                    "./test/specimens/factor-bundle/deps/a.js",
                    "./test/specimens/factor-bundle/deps/b.js"
                ]);

            mkdirp.sync("./test/output/factor-bundle/deps");

            build.plugin(plugin, {
                css : "./test/output/factor-bundle/deps/deps.css"
            });

            build.plugin("factor-bundle", {
                outputs : [
                    "./test/output/factor-bundle/deps/a.js",
                    "./test/output/factor-bundle/deps/b.js"
                ]
            });

            bundle(build, function() {
                compare.results("/factor-bundle/deps/deps.css");
                compare.results("/factor-bundle/deps/a.css");

                done();
            });
        });

        it("should support relative paths within factor-bundle files", function(done) {
            var build = browserify([
                    "./test/specimens/factor-bundle/relative/a.js",
                    "./test/specimens/factor-bundle/relative/b.js"
                ]);

            mkdirp.sync("./test/output/factor-bundle/relative");

            build.plugin(plugin, {
                css : "./test/output/factor-bundle/relative/relative.css"
            });

            build.plugin("factor-bundle", {
                outputs : [
                    "./test/output/factor-bundle/relative/a.js",
                    "./test/output/factor-bundle/relative/b.js"
                ]
            });

            bundle(build, function() {
                compare.results("/factor-bundle/relative/relative.css");
                compare.results("/factor-bundle/relative/a.css");

                done();
            });
        });

        it("should avoid outputting empty css files by default", function(done) {
            var build = browserify([
                    "./test/specimens/factor-bundle/noempty/a.js",
                    "./test/specimens/factor-bundle/noempty/b.js"
                ]);

            mkdirp.sync("./test/output/factor-bundle/noempty");

            build.plugin(plugin, {
                css : "./test/output/factor-bundle/noempty/noempty.css"
            });

            build.plugin("factor-bundle", {
                outputs : [
                    "./test/output/factor-bundle/noempty/a.js",
                    "./test/output/factor-bundle/noempty/b.js"
                ]
            });

            bundle(build, function() {
                assert.throws(function() {
                    fs.statSync("./test/output/factor-bundle/noempty/b.css");
                });

                compare.results("/factor-bundle/noempty/noempty.css");
                compare.results("/factor-bundle/noempty/a.css");

                done();
            });
        });

        it("should output empty css files when asked", function(done) {
            var build = browserify([
                    "./test/specimens/factor-bundle/empty/a.js",
                    "./test/specimens/factor-bundle/empty/b.js"
                ]);

            mkdirp.sync("./test/output/factor-bundle/empty");

            build.plugin(plugin, {
                css   : "./test/output/factor-bundle/empty/empty.css",
                empty : true
            });

            build.plugin("factor-bundle", {
                outputs : [
                    "./test/output/factor-bundle/empty/a.js",
                    "./test/output/factor-bundle/empty/b.js"
                ]
            });

            bundle(build, function() {
                compare.results("/factor-bundle/empty/empty.css");
                compare.results("/factor-bundle/empty/a.css");
                compare.results("/factor-bundle/empty/b.css");

                done();
            });
        });
    });

    describe("watchify", function() {
        afterAll(function(done) {
            rimraf("./test/output/watchify", done);
        });

        describe("caching", function() {
            afterAll(function() {
                shell.rm("./test/specimens/watchify/caching.css");
            });

            it("shouldn't cache file contents between watchify runs", function(done) {
                var build = browserify();

                shell.cp("-f",
                    "./test/specimens/simple.css",
                    "./test/specimens/watchify/caching.css"
                );

                build.add(from("require('./test/specimens/watchify/caching.css');"));

                build.plugin("watchify");
                build.plugin(plugin, {
                    css : "./test/output/watchify/caching.css"
                });

                // File changed
                build.on("update", function() {
                    bundle(build, function() {
                        compare.results("/watchify/caching.css", "/watchify/caching-2.css");

                        build.close();

                        done();
                    });
                });

                // Run first bundle, start watching
                bundle(build, function() {
                    compare.results("/watchify/caching.css", "/watchify/caching-1.css");

                    shell.cp("-f",
                        "./test/specimens/blue.css",
                        "./test/specimens/watchify/caching.css"
                    );
                });
            });
        });

        describe("error handling", function() {
            afterAll(function() {
                shell.rm("./test/specimens/watchify/errors.css");
            });

            it("shouldn't explode on invalid CSS", function(done) {
                var build = browserify(),
                    wait;

                shell.cp("-f",
                    "./test/specimens/invalid.css",
                    "./test/specimens/watchify/errors.css"
                );

                build.add(from("require('./test/specimens/watchify/errors.css');"));

                build.plugin("watchify");
                build.plugin(plugin, {
                    css : "./test/output/watchify/errors.css"
                });

                // File changed
                build.on("update", function() {
                    // Attempt to bundle again
                    bundle(build, function() {
                        compare.results("/watchify/errors.css", "/watchify/errors.css");

                        build.close();

                        done();
                    });
                });

                // Run first bundle to start watching
                build.bundle(function(err) {
                    // This one should fail, but not stop watchify from running
                    assert(err);
                    assert(err.name === "SyntaxError" || err.name === "CssSyntaxError");

                    if(wait) {
                        return;
                    }

                    // Wrapped because browserify event lifecycle is... odd
                    wait = setImmediate(function() {
                        shell.cp("-f",
                            "./test/specimens/blue.css",
                            "./test/specimens/watchify/errors.css"
                        );
                    });
                });
            });
        });

        describe("caching", function() {
            it("shouldn't cache file contents between watchify runs", function(done) {
                var build = browserify(from("require('./test/specimens/watchify/relative.css');"));

                build.plugin("watchify");
                build.plugin(plugin, {
                    css : "./test/output/watchify/relative.css"
                });

                // File changed
                build.on("update", function() {
                    bundle(build, function() {
                        compare.results("/watchify/relative.css");

                        build.close();

                        done();
                    });
                });

                // Run first bundle, start watching
                bundle(build, function() {
                    compare.results("/watchify/relative.css");

                    // Trigger a rebuild
                    fs.utimesSync("./test/specimens/watchify/relative.css", new Date(), new Date());
                });
            });
        });
    });
});
