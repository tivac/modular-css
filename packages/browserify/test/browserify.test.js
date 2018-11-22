"use strict";

const browserify = require("browserify");
const from       = require("from2-string");
const shell      = require("shelljs");
const read = require("@modular-css/test-utils/read.js")(__dirname);
const bundle = require("./lib/bundle.js");
const plugin = require("../browserify.js");

describe("/browserify.js", () => {
    // Because these tests keep failing CI...
    jest.setTimeout(20000);
        
    afterAll(() => shell.rm("-rf", "./packages/browserify/test/output/browserify"));

    describe("basic functionality", () => {
        it("should not error if no options are supplied", () => {
            const build = browserify();
            const error = jest.fn();

            build.on("error", error);

            build.plugin(plugin);

            expect(error).not.toHaveBeenCalled();
        });
        
        it("should error if an invalid extension is applied", (done) => {
            const build = browserify();
            
            build.on("error", (err) => {
                expect(err).toMatchSnapshot();

                done();
            });

            build.plugin(plugin, { ext : false });
        });

        it("should error on invalid CSS", (done) => {
            const build = browserify({
                    entries : from("require('./packages/browserify/test/specimens/invalid.css');"),
                });

            let errors = 0;

            build.plugin(plugin);

            build.bundle((err) => {
                ++errors;
                
                expect(err).toBeTruthy();
                
                if(errors === 1) {
                    expect(err.name).toMatch(/SyntaxError|CssSyntaxError/);
                    
                    return false;
                }
                
                return done();
            });
        });

        it("should replace require() calls with the exported identifiers", async () => {
            const build = browserify({
                entries : from("require('./packages/browserify/test/specimens/simple.css');"),
            });
            
            build.plugin(plugin);
            
            const out = await bundle(build);
            
            expect(out.toString()).toMatchSnapshot();
        });

        it("should correctly rewrite urls based on the destination file", async () => {
            const build = browserify({
                entries : from("require('./packages/browserify/test/specimens/relative.css');"),
            });
            
            build.plugin(plugin, {
                css : "./packages/browserify/test/output/browserify/relative.css",
            });
            
            await bundle(build);
            
            expect(read("./browserify/relative.css")).toMatchSnapshot();
        });

        it("should use the specified namer function", async () => {
            const build = browserify({
                entries : from("require('./packages/browserify/test/specimens/keyframes.css');"),
            });
            
            build.plugin(plugin, {
                css   : "./packages/browserify/test/output/browserify/namer-fn.css",
                namer : () => "a",
            });
            
            await bundle(build);
            
            expect(read("./browserify/namer-fn.css")).toMatchSnapshot();
        });

        it("should include all CSS dependencies in output css", async () => {
            const build = browserify({
                entries : from("require('./packages/browserify/test/specimens/start.css');"),
            });
            
            build.plugin(plugin, { css : "./packages/browserify/test/output/browserify/include-css-deps.css" });
            
            const out = await bundle(build);

            expect(out).toMatchSnapshot();
            expect(read("./browserify/include-css-deps.css")).toMatchSnapshot();
        });

        it("should write out the complete exported identifiers when `json` is specified", async () => {
            const build = browserify(from("require('./packages/browserify/test/specimens/multiple.css');"));
            
            build.plugin(plugin, {
                json : "./packages/browserify/test/output/browserify/export-all-identifiers.json",
            });
            
            await bundle(build);
            
            expect(read("./browserify/export-all-identifiers.json")).toMatchSnapshot();
        });

        it("should not include duplicate files in the output multiple times", async () => {
            const build = browserify(
                from("require('./packages/browserify/test/specimens/start.css'); require('./packages/browserify/test/specimens/local.css');")
            );
            
            build.plugin(plugin, { css : "./packages/browserify/test/output/browserify/avoid-duplicates.css" });
            
            const out = await bundle(build);

            expect(out).toMatchSnapshot();
            expect(read("./browserify/avoid-duplicates.css")).toMatchSnapshot();
        });
        
        it("should output an inline source map when the debug option is specified", async () => {
            const build = browserify({
                debug   : true,
                entries : from("require('./packages/browserify/test/specimens/start.css');"),
            });
            
            build.plugin(plugin, { css : "./packages/browserify/test/output/browserify/source-maps.css" });
            
            await bundle(build);
            
            expect(read("./browserify/source-maps.css")).toMatchSnapshot();
        });

        it("should output an external source map when the debug option is specified", async () => {
            const build = browserify({
                debug   : true,
                entries : from("require('./packages/browserify/test/specimens/start.css');"),
            });

            build.plugin(plugin, {
                css : "./packages/browserify/test/output/browserify/source-maps.css",
                map : {
                    inline : false,
                },
            });

            await bundle(build);
            
            expect(read("./browserify/source-maps.css")).toMatchSnapshot();
            expect(read("./browserify/source-maps.css.map")).toMatchSnapshot();
        });
    });
});
