"use strict";

var path = require("path"),
    
    relative = require("../lib/relative.js");

describe("/lib", function() {
    describe("/relative.js", function() {
        it("should be a function", function() {
            expect(typeof relative).toBe("function");
        });

        it(`should export a "prefixed" property`, function() {
            expect(typeof relative.prefixed).toBe("function");
        });
        
        it("should resolve absolute files against a specified cwd", function() {
            expect(
                relative(
                    process.cwd(),
                    require.resolve("./specimens/start.css")
                )
            )
            .toMatchSnapshot();
            
            expect(
                relative(
                    __dirname,
                    require.resolve("./specimens/start.css")
                )
            )
            .toMatchSnapshot();
        });

        it("should resolve relative files against a specified cwd", function() {
            expect(
                relative(
                    process.cwd(),
                    "./packages/core/test/specimens/start.css"
                )
            )
            .toMatchSnapshot();
            
            expect(
                relative(
                    __dirname,
                    "./packages/core/test/specimens/start.css"
                )
            )
            .toMatchSnapshot();
        });

        it("should resolve files against a specified cwd w/ prefixes", function() {
            expect(
                relative.prefixed(
                    process.cwd(),
                    path.resolve("./packages/core/test/specimens/start.css")
                )
            )
            .toMatchSnapshot();
            
            expect(
                relative.prefixed(
                    path.resolve("./packages/core/test/specimens/"),
                    require.resolve("./lib.relative.test.js")
                )
            )
            .toMatchSnapshot();
        });
    });
});
