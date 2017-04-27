"use strict";

var plugin = require("../plugins/scoping.js"),

    processor = require("postcss")([ plugin ]);

function process(src, options) {
    return processor.process(
        src,
        Object.assign(Object.create(null), {
            from  : "packages/core/test/specimens/a.css",
            namer : (file, selector) => `a_${selector}`
        },
        options || {})
    );
}

describe("/issues", () => {
    describe("/277", () => {
        it("should transform multiple :global(...) in a single selector", () => {
            expect(
                process(":global(.a) :global(.b) { color: red; }").css
            )
            .toMatchSnapshot();
        });
    });
});
