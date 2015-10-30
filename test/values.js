var assert = require("assert"),
    plugin = require("../plugins/values");

function css(src, options) {
    return plugin.process(src, options).css;
}

describe("postcss-css-modules", function() {
    describe("values", function() {
        it("should support values in declarations", function() {
            assert.equal(
                css("@value color: red; .wooga { color: color; }"),
                ".9dfd56c12e5e02cccbceec36981f8c11_wooga { color: red; }"
            );
        });
    });
});
