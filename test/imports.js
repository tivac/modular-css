var assert = require("assert"),
    plugin = require("../plugins/imports");

function css(src, options) {
    return plugin.process(src, options).css;
}

describe("postcss-css-modules", function() {
    describe.only("imports", function() {
        it("should find import declarations", function() {
            assert.equal(
                css(
                    "@value color from \"./colors.css\"; @value one, two from \"./others.css\"; .wooga { composes: fooga from \"./fooga.css\"; }",
                    { from : "./test.css" }
                ),
                ".wooga { color: red; }"
            );
        });
    });
});
