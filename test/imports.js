"use strict";

var assert = require("assert"),
    imports = require("../imports");

describe("postcss-css-modules", function() {
    describe.only("imports", function() {
        it("should find import declarations", function() {
            assert.equal(
                imports.process("./test/specimens/imports/start.css"),
                ".wooga { color: red; }"
            );
        });
    });
});
