"use strict";

var fs   = require("fs"),
    path = require("path"),

    webpack = require("webpack"),

    read  = require("test-utils/read.js")(__dirname),
    namer = require("test-utils/namer.js"),
    
    Plugin  = require("../plugin.js"),

    use  = require.resolve("../loader.js"),
    test = /\.css$/;

function success(err, stats) {
    expect(err).toBeFalsy();
    if(stats.hasErrors()) {
        throw stats.toJson().errors[0];
    }
}

describe("/webpack.js", function() {
    var output = path.resolve(__dirname, "./output");
    
    afterAll(() => require("shelljs").rm("-rf", "./packages/webpack/test/output/*"));

    it("should be a function", function() {
        expect(typeof Plugin).toBe("function");
    });

    it("should output css to disk", function(done) {
        webpack({
            entry  : "./packages/webpack/test/specimens/simple.js",
            output : {
                path     : output,
                filename : "./simple.js"
            },
            module : {
                rules : [
                    {
                        test,
                        use
                    }
                ]
            },
            plugins : [
                new Plugin({
                    namer,
                    css : "./simple.css"
                })
            ]
        }, (err, stats) => {
            success(err, stats);

            expect(read("simple.js")).toMatchSnapshot();
            expect(read("simple.css")).toMatchSnapshot();

            done();
        });
    });

    it("should output json to disk", function(done) {
        webpack({
            entry  : "./packages/webpack/test/specimens/simple.js",
            output : {
                path     : output,
                filename : "./simple.js"
            },
            module : {
                rules : [
                    {
                        test,
                        use
                    }
                ]
            },
            plugins : [
                new Plugin({
                    namer,
                    json : "./simple.json"
                })
            ]
        }, (err, stats) => {
            success(err, stats);

            expect(read("simple.js")).toMatchSnapshot();
            expect(read("simple.json")).toMatchSnapshot();

            done();
        });
    });

    it("should report errors", function(done) {
        webpack({
            entry  : "./packages/webpack/test/specimens/invalid.js",
            output : {
                path     : output,
                filename : "./invalid.js"
            },
            module : {
                rules : [
                    {
                        test,
                        use
                    }
                ]
            },
            plugins : [
                new Plugin({
                    namer
                })
            ]
        }, (err, stats) => {
            expect(stats.hasErrors()).toBeTruthy();

            expect(stats.toJson().errors[0]).toMatch("Invalid composes reference");

            done();
        });
    });

    it("should report warnings on invalid property names", function(done) {
        webpack({
            entry  : "./packages/webpack/test/specimens/invalid-name.js",
            output : {
                path     : output,
                filename : "./invalid-name.js"
            },
            module : {
                rules : [
                    {
                        test,
                        use
                    }
                ]
            },
            plugins : [
                new Plugin({
                    namer
                })
            ]
        }, (err, stats) => {
            expect(stats.hasWarnings()).toBeTruthy();

            expect(stats.toJson().warnings[0]).toMatch("Invalid JS identifier");

            done();
        });
    });

    it("should handle dependencies", function(done) {
        webpack({
            entry  : "./packages/webpack/test/specimens/start.js",
            output : {
                path     : output,
                filename : "./start.js"
            },
            module : {
                rules : [
                    {
                        test,
                        use
                    }
                ]
            },
            plugins : [
                new Plugin({
                    namer,
                    css  : "./start.css",
                    json : "./start.json"
                })
            ]
        }, (err, stats) => {
            success(err, stats);

            expect(read("start.js")).toMatchSnapshot();
            expect(read("start.css")).toMatchSnapshot();
            expect(read("start.json")).toMatchSnapshot();

            done();
        });
    });

    it("should support ES2015 default exports", function(done) {
        webpack({
            entry  : "./packages/webpack/test/specimens/es2015-default.js",
            output : {
                path     : output,
                filename : "./es2015-default.js"
            },
            module : {
                rules : [
                    {
                        test,
                        use
                    }
                ]
            },
            plugins : [
                new Plugin({
                    namer,
                    css : "./es2015-default.css"
                })
            ]
        }, (err, stats) => {
            success(err, stats);

            expect(read("es2015-default.js")).toMatchSnapshot();
            expect(read("es2015-default.css")).toMatchSnapshot();

            done();
        });
    });

    it("should support ES2015 named exports", function(done) {
        webpack({
            entry  : "./packages/webpack/test/specimens/es2015-named.js",
            output : {
                path     : output,
                filename : "./es2015-named.js"
            },
            module : {
                rules : [
                    {
                        test,
                        use
                    }
                ]
            },
            plugins : [
                new Plugin({
                    namer,
                    css : "./es2015-named.css"
                })
            ]
        }, (err, stats) => {
            success(err, stats);

            expect(read("es2015-named.js")).toMatchSnapshot();
            expect(read("es2015-named.css")).toMatchSnapshot();

            done();
        });
    });

    it("should support CommonJS exports when the option is set", function(done) {
        webpack({
            entry  : "./packages/webpack/test/specimens/simple.js",
            output : {
                path     : output,
                filename : "./simple.js"
            },
            module : {
                rules : [
                    {
                        test,
                        use : {
                            loader  : use,
                            options : {
                                cjs : true
                            }
                        }
                    }
                ]
            },
            plugins : [
                new Plugin({
                    namer,
                    css : "./simple.css"
                })
            ]
        }, (err, stats) => {
            success(err, stats);

            expect(read("simple.js")).toMatchSnapshot();

            done();
        });
    });

    it("should generate correct builds in watch mode when files change", function(done) {
        var changed = 0,
            compiler, watcher;
        
        // Create v1 of the file
        fs.writeFileSync(
            "./packages/webpack/test/output/watched.css",
            ".one { color: red; }"
        );

        compiler = webpack({
            entry  : "./packages/webpack/test/specimens/watch.js",
            output : {
                path     : output,
                filename : "./watching.js"
            },
            module : {
                rules : [
                    {
                        test,
                        use
                    }
                ]
            },
            plugins : [
                new Plugin({
                    namer,
                    css : "./watching.css"
                })
            ]
        });
        
        watcher = compiler.watch({ }, (err, stats) => {
            /* eslint consistent-return: off */
            changed++;
            
            success(err, stats);

            expect(read("watching.js")).toMatchSnapshot(`webpack watching.js ${changed}`);
            expect(read("watching.css")).toMatchSnapshot(`webpack watching.css ${changed}`);

            if(changed > 1) {
                watcher.close();

                return done();
            }
        });

        setTimeout(() => fs.writeFileSync(
            "./packages/webpack/test/output/watched.css",
            ".two { color: blue; }"
        ), 100);
    });

    it("should generate correct builds when files change", function() {
        var changed = "./packages/webpack/test/output/changed.css",
            compiler;
        
        // wrap compiler.run in a promise for easier chaining
        function run() {
            return new Promise((resolve, reject) =>
                compiler.run((err, stats) =>
                    (stats.hasErrors() ? reject(stats) : resolve(stats))
                )
            );
        }

        compiler = webpack({
            entry  : "./packages/webpack/test/specimens/change.js",
            output : {
                path     : output,
                filename : "./changing.js"
            },
            module : {
                rules : [
                    {
                        test,
                        use
                    }
                ]
            },
            plugins : [
                new Plugin({
                    namer,
                    css : "./changing.css"
                })
            ]
        });
        
        // Create v1 of the file
        fs.writeFileSync(changed, ".one { color: red; }");

        // Run webpack the first time
        return run()
            .then(() => {
                expect(read("changing.js")).toMatchSnapshot();
                expect(read("changing.css")).toMatchSnapshot();
            
                // v2 of the file
                fs.writeFileSync(changed, ".two { color: blue; }");

                return run();
            })
            .then(() => {
                expect(read("changing.js")).toMatchSnapshot();
                expect(read("changing.css")).toMatchSnapshot();

                fs.unlinkSync(changed);

                return run();
            })
            // This build fails because the file is missing
            .catch((stats) => {
                expect(stats.toJson().errors[0]).toMatch("no such file or directory");
                
                fs.writeFileSync(changed, ".two { color: green; }");

                return run();
            })
            .then(() => {
                expect(read("changing.js")).toMatchSnapshot();
                expect(read("changing.css")).toMatchSnapshot();
            });
    });
});
