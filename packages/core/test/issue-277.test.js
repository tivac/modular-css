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

describe("/plugins", function() {
    describe("/scoping.js", function() {
        describe(":global issue()", function() {
            it("shouldn't transform global selectors", function() {
                expect(
                    process(":global(.a) :global(.b) { color: red; }").css
                )
                .toMatchSnapshot();
            });
        });
    });
});
