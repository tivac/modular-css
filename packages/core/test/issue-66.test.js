"use strict";

var Processor = require("../processor.js");

describe("/issues", function() {
    describe("/66", function() {
        it("should ignore remove calls for unknown files", function() {
            var processor = new Processor();

            return processor.string(
                "./packages/core/test/specimens/a.css",
                ".aooga { }"
            )
            .then(() => expect(() => processor.remove("./fooga.js")).not.toThrow());
        });
    });
});
