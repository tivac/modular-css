const { describe, it } = require("node:test");

const dedent = require("dedent");

const Processor = require("@modular-css/processor");
const namer = require("@modular-css/test-utils/namer.js");
const paths = require("../paths.js");

describe("@modular-css/path-resolver", () => {
    it("should return a falsey value if a file isn't found", (t) => {
        const fn = paths({
            paths : [
                "./packages/paths/test/specimens",
            ],
        });

        t.assert.ok(!fn(".", "./fooga.css"));
    });

    it("should return the absolute path if a file is found", (t) => {
        const fn = paths({
            paths : [
                "./packages/paths/test/specimens/one",
            ],
        });

        t.assert.strictEqual(
            fn(".", "./one.css"),
            require.resolve("./specimens/one/one.css"),
        );
    });

    it("should check multiple paths for files & return the first match", (t) => {
        const fn = paths({
            paths : [
                "./packages/paths/test/specimens/one",
                "./packages/paths/test/specimens/one/sub",
            ],
        });

        t.assert.strictEqual(
            fn(".", "./sub.css"),
            require.resolve("./specimens/one/sub/sub.css"),
        );
    });

    it("should be usable as a modular-css resolver", async (t) => {
        const processor = new Processor({
            namer,
            resolvers : [
                paths({
                    paths : [
                        "./packages/paths/test/specimens/one/sub",
                        "./packages/paths/test/specimens/two",
                    ],
                }),
            ],
        });
        
        await processor.string(
            "./packages/paths/test/specimens/one/start.css",
            dedent(`
                @value sub from "./sub.css";
                
                .rule {
                    composes: two from "./two.css";
                }
            `)
        );

        const { compositions } = await processor.output();
        
        t.assert.snapshot(compositions);
    });
});
