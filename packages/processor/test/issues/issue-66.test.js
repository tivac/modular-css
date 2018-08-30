"use strict";

var Processor = require("../../processor.js");

describe("/issues", () => {
    describe("/66", () => {
        it("should ignore remove calls for unknown files", () => {
            var processor = new Processor();

            return processor.string(
                "./packages/processor/test/specimens/a.css",
                ".aooga { }"
            )
            .then(() =>
                expect(() =>
                    processor.remove("./fooga.js")
                )
                .not.toThrow()
            );
        });
    });
});
