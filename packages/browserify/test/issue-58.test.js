"use strict";

const from = require("from2-string");
const shell = require("shelljs");
const browserify = require("browserify");
const watchify  = require("watchify");
    
const read = require("@modular-css/test-utils/read.js")(__dirname);
const write = require("@modular-css/test-utils/write.js")(__dirname);

const bundle = require("./lib/bundle.js");
const plugin = require("../browserify.js");

describe("/browserify.js", () => {
    describe("/issues", () => {
        describe("/58", () => {
            afterAll(() => shell.rm("-rf", "./packages/browserify/test/output/issues"));
            
            it("should update when CSS dependencies change", (done) => {
                const build = browserify();
                
                write("./issues/58/issue.css", `
                    .issue1 {
                        composes: other1 from "./other.css";
                        color: teal;
                    }

                    .issue2 {
                        composes: issue1;
                        composes: other3 from "./other.css";
                        color: aqua;
                    }
                `);

                write("./issues/58/other.css", `
                    .other1 { color: red; }
                    .other2 { color: navy; }
                    .other3 { color: blue; }
                `);
                
                build.add(
                    from("require('./packages/browserify/test/output/issues/58/issue.css');")
                );

                build.plugin(watchify);
                build.plugin(plugin, {
                    css : "./packages/browserify/test/output/issues/58.css",
                });

                build.on("update", () => {
                    bundle(build).then((out) => {
                        expect(out).toMatchSnapshot();
                        expect(read("./issues/58.css")).toMatchSnapshot();
                    
                        build.close();
                        done();
                    });
                });

                bundle(build).then((out) => {
                    expect(out).toMatchSnapshot();
                    
                    write("./issues/58/other.css", `
                        .other1 { color: green; }
                        .other2 { color: yellow; }
                        .other3 { composes: other2; background: white; }
                    `);
                });
            });
        });
    });
});
