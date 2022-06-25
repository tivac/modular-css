/* eslint max-statements: "off" */
"use strict";

const path = require("path");

const dedent = require("dedent");
const Processor = require("@modular-css/processor");

const { transform } = require("../css-to-js.js");

const root = path.resolve(__dirname, "../../../").replace(/\\/g, "/");
const safe = "<ROOT-DIR>";

expect.addSnapshotSerializer({
    print(val) {
        return val.replace(root, safe);
    },
    test(val) {
        return typeof val === "string";
    },
});

const resolvers = [
    (src, file) =>
        // console.log({ src, file, result : path.join(path.dirname(src), file) });
        
         path.join(path.dirname(src), file),
];

describe("@modular-css/css-to-js API", () => {
    it("should be a function", () =>
        expect(typeof transform).toBe("function")
    );

    it("should generate javascript", async () => {
        const processor = new Processor({ resolvers });

        await processor.string("./a.css", `.a { color: red; }`);

        const { code, namedExports } = transform(processor.normalize("./a.css"), processor);

        expect(code).toMatchSnapshot();
        expect(namedExports).toEqual([ "a" ]);
    });

    it("should generate a javscript proxy in dev", async () => {
        const processor = new Processor({ resolvers });

        await processor.string("./a.css", `.a { color: red; }`);

        const { code } = transform(processor.normalize("./a.css"), processor, { dev : true });

        expect(code).toMatchSnapshot();
    });

    it("should represent local composition", async () => {
        const processor = new Processor({ resolvers });

        await processor.string("./a.css", `.a { color: blue; } .b { composes: a; }`);

        const { code, namedExports } = transform(processor.normalize("./a.css"), processor);

        expect(code).toMatchSnapshot();
        expect(namedExports).toEqual([ "a", "b" ]);
    });

    it("should represent external composition", async () => {
        const processor = new Processor({ resolvers });

        await processor.string("./a.css", `.a { color: red; }`);

        await processor.string("./b.css", `.b { composes: a from "./a.css"; color: blue; }`);

        const { code, namedExports } = transform(processor.normalize("./b.css"), processor);

        expect(code).toMatchSnapshot();
        expect(namedExports).toEqual([ "b" ]);
    });

    it("should dedupe repeated identifiers", async () => {
        const processor = new Processor({ resolvers });

        await processor.string("./a.css", `.a { color: red; }`);
        await processor.string("./b.css", `.a { composes: a from "./a.css"; color: blue; }`);

        const { code, namedExports } = transform(processor.normalize("./b.css"), processor);

        expect(code).toMatchSnapshot();
        expect(namedExports).toEqual([ "a1 as a" ]);
    });

    it("should represent local @values", async () => {
        const processor = new Processor({ resolvers });

        await processor.string("./a.css", `@value v: #00F; .a { color: v; }`);

        const { code, namedExports } = transform(processor.normalize("./a.css"), processor);

        expect(code).toMatchSnapshot();
        expect(namedExports).toEqual([ "$values", "a" ]);
    });

    it("should represent external @values", async () => {
        const processor = new Processor({ resolvers });

        await processor.string("./a.css", `@value v: #00F;`);
        await processor.string("./b.css", `@value v from "./a.css"; .b { color: v; }`);

        const { code, namedExports } = transform(processor.normalize("./b.css"), processor);

        expect(code).toMatchSnapshot();
        expect(namedExports).toEqual([ "$values", "b" ]);
    });

    it.each([
        {},
        { rewriteInvalid : false },
        { warn : false },
        { rewriteInvalid : false, warn : false },
    ])("should rewrite invalid identifiers & warn %s", async (namedExports) => {
        const processor = new Processor({ resolvers });

        await processor.string("./a.css", `.a-1 { color: red; }`);

        const { code, namedExports : exported, warnings } = transform(processor.normalize("./a.css"), processor, { namedExports });

        expect(code).toMatchSnapshot();
        expect(warnings).toMatchSnapshot("warnings");
        expect(exported).toMatchSnapshot("named exports");
    });
});
