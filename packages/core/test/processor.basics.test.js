"use strict";

var Processor = require("../processor.js");

describe("/processor.js", function() {
    describe("Basics", function() {
        it("should be a function", function() {
            expect(typeof Processor).toBe("function");
        });
        
        it("should auto-instantiate if called without new", function() {
            /* eslint new-cap:0 */
            expect(Processor()).toBeInstanceOf(Processor);
        });
    });
});
