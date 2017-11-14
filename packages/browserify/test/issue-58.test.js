"use strict";

var fs = require("fs"),

    from       = require("from2-string"),
    shell      = require("shelljs"),
    browserify = require("browserify"),
    watchify   = require("watchify"),
    dedent     = require("dedent"),
    
    read = require("test-utils/read.js")(__dirname),

    bundle = require("./lib/bundle.js"),
    plugin = require("../browserify.js");

function write(txt) {
    fs.writeFileSync(
        "./packages/browserify/test/specimens/issues/58/other.css",
        dedent(txt),
        "utf8"
    );
}

describe("/browserify.js", () => {
    describe("/issues", () => {
        describe("/58", () => {
            afterAll(() => {
                shell.rm("-rf", "./packages/browserify/test/output/issues");
                shell.rm("./packages/browserify/test/specimens/issues/58/other.css");
            });
            
            it("should update when CSS dependencies change", (done) => {
                var build = browserify();
                
                write(`
                    .other1 { color: red; }
                    .other2 { color: navy; }
                    .other3 { color: blue; }
                `);
                
                build.add(
                    from("require('./packages/browserify/test/specimens/issues/58/issue.css');")
                );

                build.plugin(watchify);
                build.plugin(plugin, {
                    css : "./packages/browserify/test/output/issues/58.css"
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
                    
                    write(`
                        .other1 { color: green; }
                        .other2 { color: yellow; }
                        .other3 { composes: other2; background: white; }
                    `);
                });
            });
        });
    });
});
