"use strict";

var path   = require("path"),
    
    relative = require("../lib/relative.js");

describe("/lib", function() {
    describe("/relative.js", function() {
        it("should be a function", function() {
            expect(typeof relative).toBe("function");
        });

        it(`should export a "prefixed" property`, function() {
            expect(typeof relative.prefixed).toBe("function");
        });
        
        it("should resolve files against a specified cwd", function() {
            expect(
                relative(
                    process.cwd(),
                    path.resolve("./packages/core/test/specimens/start.css")
                )
            ).toBe(
                "packages/core/test/specimens/start.css"
            );
            
            expect(
                relative(
                    path.resolve("./packages/core/test"),
                    path.resolve("./packages/core/test/specimens/start.css")
                )
            ).toBe(
                "specimens/start.css"
            );
        });

        it("should resolve files against a specified cwd w/ prefixes", function() {
            expect(
                relative.prefixed(
                    process.cwd(),
                    path.resolve("./packages/core/test/specimens/start.css")
                )
            ).toBe(
                "./packages/core/test/specimens/start.css"
            );
            
            expect(
                relative.prefixed(
                    path.resolve("./packages/core/test/specimens/"),
                    path.resolve("./packages/core/test/lib.relative.test.js")
                )
            ).toBe(
                "../lib.relative.test.js"
            );
        });
    });
});
