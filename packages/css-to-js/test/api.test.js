const { describe, it } = require("node:test");

const path = require("path");

const dedent = require("dedent");
const Processor = require("@modular-css/processor");

const { transform } = require("../css-to-js.js");

const root = process.cwd().replace(/\\/g, "/");
const safe = "<ROOT-DIR>";

const serializers = [ (value) => {
    value = value.replace(root, safe);

    return JSON.stringify(value, null, 2);
} ];


const resolvers = [
    (src, file) => path.join(path.dirname(src), file),
];

describe("@modular-css/css-to-js API", () => {
    it("should be a function", (t) =>
        t.assert.strictEqual(typeof transform, "function")
    );

    it("should generate javascript", async (t) => {
        const processor = new Processor({ resolvers });

        await processor.string("./a.css", `.a { color: red; }`);

        const { code, namedExports } = transform("./a.css", processor);

        t.assert.snapshot(code, { serializers });
        t.assert.deepStrictEqual(namedExports, [ "a" ]);
    });

    it("should generate a javscript proxy in dev", async (t) => {
        const processor = new Processor({ resolvers });

        await processor.string("./a.css", `.a { color: red; }`);

        const { code } = transform("./a.css", processor, { dev : true });

        t.assert.snapshot(code, { serializers });
    });

    it("should deconflict the variable name in dev", async (t) => {
        const processor = new Processor({ resolvers });

        await processor.string("./a.css", `.data { color: red; }`);

        const { code } = transform("./a.css", processor, { dev : true });

        t.assert.snapshot(code, { serializers });
    });


    it("should generate empty results & a warning on invalid file input", async (t) => {
        const processor = new Processor({ resolvers });

        await processor.string("./a.css", `.a { color: red; }`);

        const { code, namedExports, warnings } = transform("./NOPE.css", processor);

        t.assert.snapshot(code, { serializers });
        t.assert.deepStrictEqual(namedExports, [ ]);
        t.assert.snapshot(warnings);
    });

    it("should represent local composition", async (t) => {
        const processor = new Processor({ resolvers });

        await processor.string("./a.css", `.a { color: blue; } .b { composes: a; }`);

        const { code, namedExports } = transform("./a.css", processor);

        t.assert.snapshot(code, { serializers });
        t.assert.deepStrictEqual(namedExports, [ "a", "b" ]);
    });

    it("should represent external composition", async (t) => {
        const processor = new Processor({ resolvers });

        await processor.string("./a.css", `.a { color: red; }`);

        await processor.string("./b.css", `.b { composes: a from "./a.css"; color: blue; }`);

        const { code, namedExports } = transform("./b.css", processor);

        t.assert.snapshot(code, { serializers });
        t.assert.deepStrictEqual(namedExports, [ "b" ]);
    });

    it("should represent global composition from external resources", async (t) => {
        const processor = new Processor({ resolvers });

        await processor.string("./a.css", `.a { composes: global(foo); color: red }`);

        const { code, namedExports } = transform("./a.css", processor, { namedExports : false });

        t.assert.snapshot(code, { serializers });
        t.assert.deepStrictEqual(namedExports, [ "a" ]);
    });

    it("should use relative imports when requested", async (t) => {
        const processor = new Processor({ resolvers });

        await processor.string("./a.css", `.a { color: red; }`);

        await processor.string("./b.css", `.b { composes: a from "./a.css"; color: blue; }`);

        const { code, namedExports } = transform("./b.css", processor, { relativeImports : true });

        t.assert.snapshot(code, { serializers });
        t.assert.deepStrictEqual(namedExports, [ "b" ]);
    });

    it("should output without default export", async (t) => {
        const processor = new Processor({ resolvers });

        await processor.string("./a.css", `.a { color: red; }`);

        const { code, namedExports } = transform("./a.css", processor, { defaultExport : false });

        t.assert.snapshot(code, { serializers });
        t.assert.deepStrictEqual(namedExports, [ "a" ]);
    });

    it("should output css when requested", async (t) => {
        const processor = new Processor({ resolvers });

        await processor.string("./a.css", `.a { color: red; }`);

        const { code, namedExports } = transform("./a.css", processor, { styleExport : true });

        t.assert.snapshot(code, { serializers });
        t.assert.deepStrictEqual(namedExports, [ "a" ]);
    });

    it("should dedupe repeated identifiers", async (t) => {
        const processor = new Processor({ resolvers });

        await processor.string("./a.css", `.a { color: red; }`);
        await processor.string("./b.css", `.a { composes: a from "./a.css"; color: blue; }`);

        const { code, namedExports } = transform("./b.css", processor);

        t.assert.snapshot(code, { serializers });
        t.assert.deepStrictEqual(namedExports, [ "a1 as a" ]);
    });

    it("should represent local @values", async (t) => {
        const processor = new Processor({ resolvers });

        await processor.string("./a.css", `@value v: #00F; .a { color: v; }`);

        const { code, namedExports } = transform("./a.css", processor);

        t.assert.snapshot(code, { serializers });
        t.assert.deepStrictEqual(namedExports, [ "$values", "a" ]);
    });

    it("should represent external @values", async (t) => {
        const processor = new Processor({ resolvers });

        await processor.string("./a.css", `@value v: #00F;`);
        await processor.string("./b.css", `@value v from "./a.css"; .b { color: v; }`);

        const { code, namedExports } = transform("./b.css", processor);

        t.assert.snapshot(code, { serializers });
        t.assert.deepStrictEqual(namedExports, [ "$values", "b" ]);
    });

    it("should represent external @values namespaces", async (t) => {
        const processor = new Processor({ resolvers });

        await processor.string("./a.css", `@value v1: #00F; @value v2: #F00; `);
        await processor.string("./b.css", dedent(`
            @value * as values from "./a.css";
            @value v: #0F0;

            .b {
                color: values.v1;
                background-color: values.v2;
                border-color: v;
            }
        `));

        const { code, namedExports } = transform("./b.css", processor);

        t.assert.snapshot(code, { serializers });
        t.assert.deepStrictEqual(namedExports, [ "$values", "b" ]);
    });

    it("should represent external @values aliased to local @values", async (t) => {
        const processor = new Processor({ resolvers });

        await processor.string("./a.css", `@value v1: #00F; @value v2: #F00; `);
        await processor.string("./b.css", dedent(`
            @value * as values from "./a.css";
            @value v: values.v1;

            .b {
                border-color: v;
            }
        `));

        const { code } = transform("./b.css", processor);

        t.assert.snapshot(code, { serializers });
    });


    it("should generate javascript from composes", async (t) => {
        const processor = new Processor({ resolvers });

        await processor.file(require.resolve("./specimens/composes/custom-first-rule.css"));

        const { code } = transform(require.resolve("./specimens/composes/custom-first-rule.css"), processor);

        t.assert.snapshot(code, { serializers });
    });

    it("should generate javascript from multiple composes", async (t) => {
        const processor = new Processor({ resolvers });

        await processor.file(require.resolve("./specimens/composes/custom-between-rules.css"));

        const { code } = transform(require.resolve("./specimens/composes/custom-between-rules.css"), processor);

        t.assert.snapshot(code, { serializers });
    });

    it("should generate javascript with var variable statements", async (t) => {
        const processor = new Processor({ resolvers });

        await processor.file(require.resolve("./specimens/simple.css"));

        const { code } = transform(require.resolve("./specimens/simple.css"), processor, { variableDeclaration : "var" });

        t.assert.snapshot(code, { serializers });
    });

    it("should output warnings when options.dev.warn is truthy", async (t) => {
        const processor = new Processor({ resolvers });

        await processor.string("./a.css", `.a { color: red; }`);

        const { code : noWarn } = transform("./a.css", processor, { dev : { warn : false } });
        const { code : warn } = transform("./a.css", processor, { dev : { warn : true } });

        t.assert.snapshot(noWarn, { serializers });
        t.assert.snapshot(warn, { serializers });
    });
    
    it("should create coverage infrastructure when options.dev.coverage is truthy", async (t) => {
        const processor = new Processor({ resolvers });

        await processor.string("./a.css", `.a { color: red; }`);

        const { code } = transform("./a.css", processor, { dev : { coverage : true } });

        t.assert.snapshot(code, { serializers });
    });

    [
        true,
        false,
        {},
        { rewriteInvalid : false },
        { warn : false },
        { rewriteInvalid : false, warn : false },
    ].forEach((namedExports) => {
        it(`should handle options.namedExports set to: ${JSON.stringify(namedExports)}`, async (t) => {
            const processor = new Processor({ resolvers });

            await processor.string("./a.css", `.a-1 { color: red; }`);

            const { code, namedExports : exported, warnings } = transform("./a.css", processor, { namedExports });

            t.assert.snapshot(code, { serializers });
            t.assert.snapshot(warnings);
            t.assert.snapshot(exported);
        });
    });
});
