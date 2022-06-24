/* eslint max-statements: "off" */
"use strict";

const path = require("path");

const dedent = require("dedent");
const Processor = require("@modular-css/processor");

const { transform } = require("../css-to-js.js");

const root = path.resolve(__dirname, "../../../").replace(/\\/g, "/");

console.log(root);

expect.addSnapshotSerializer(({
    test(val) {
        return typeof val === "string" && val.indexOf(root);
    },
    print(val) {
        return val.replace(root, "");
    },
}));

describe("@modular-css/css-to-js API", () => {
    it("should be a function", () =>
        expect(typeof transform).toBe("function")
    );

    it("should generate javascript", async () => {
        const processor = new Processor();

        await processor.string("./test.js", `.foo { color: red; }`);

        const { code, namedExports } = transform(processor.normalize("./test.js"), processor);

        expect(code).toMatchSnapshot();
        expect(namedExports).toEqual([ "foo" ]);
    });

    it("should represent local composition", async () => {
        const processor = new Processor();

        await processor.string("./test.js", `.bar { color: blue; } .foo { composes: bar; }`);

        const { code, namedExports } = transform(processor.normalize("./test.js"), processor);

        expect(code).toMatchSnapshot();
        expect(namedExports).toEqual([ "bar", "foo" ]);
    });

    it("should represent external composition", async () => {
        const processor = new Processor();

        const css = require.resolve("./specimens/dependencies.css");

        await processor.file(css);

        const { code, namedExports } = transform(css, processor);

        expect(code).toMatchSnapshot();
        expect(namedExports).toEqual([ "wooga" ]);
    });
});
