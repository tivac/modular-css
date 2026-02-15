const { describe, it } = require("node:test");

const { dedent } = require("dentist");
    
const Processor = require("@modular-css/processor");
const namer     = require("@modular-css/test-utils/namer.js");

const aliases = require("../aliases.js");

describe("@modular-css/path-aliases", () => {
    it("should return a falsey value if a file isn't found", (t) => {
        const fn = aliases({
            aliases : {
                specimens : "./packages/aliases/test/specimens",
            },
        });

        t.assert.ok(!fn(".", "specimens/fooga.css"));
    });

    it("should return the absolute path if a file is found", (t) => {
        const fn = aliases({
            aliases : {
                one : "./packages/aliases/test/specimens/one",
            },
        });

        t.assert.strictEqual(
            fn(".", "one/one.css"),
            require.resolve("./specimens/one/one.css"),
        );
    });

    it("should allow regex characters in keys", (t) => {
        const fn = aliases({
            aliases : {
                $one : "./packages/aliases/test/specimens/one",
            },
        });

        t.assert.strictEqual(
            fn(".", "$one/one.css"),
            require.resolve("./specimens/one/one.css"),
        );
    });

    it("should check multiple aliases for files & return the first match", (t) => {
        const fn = aliases({
            aliases : {
                one : "./packages/aliases/test/specimens/one",
                two : "./packages/aliases/test/specimens/two",
                sub : "./packages/aliases/test/specimens/one/sub",
            },
        });

        t.assert.strictEqual(
            fn(".", "one/one.css"),
            require.resolve("./specimens/one/one.css"),
        );

        t.assert.strictEqual(
            fn(".", "sub/sub.css"),
            require.resolve("./specimens/one/sub/sub.css"),
        );
    });

    it("should be usable as a modular-css resolver", async (t) => {
        const processor = new Processor({
            namer,
            resolvers : [
                aliases({
                    aliases : {
                        sub : "./packages/aliases/test/specimens/one/sub",
                        two : "./packages/aliases/test/specimens/two",
                    },
                }),
            ],
        });
        
        await processor.string(
            "./packages/paths/test/specimens/one/start.css",
            dedent(`
                @value sub from "sub/sub.css";
                
                .rule {
                    composes: two from "two/two.css";
                }
            `)
        );

        const { compositions } = await processor.output();

        t.assert.snapshot(compositions);
    });

    it("should fall through to the default resolver", async (t) => {
        const processor = new Processor({
            namer,
            resolvers : [
                aliases({
                    aliases : {
                        two : "./packages/aliases/test/specimens/two",
                    },
                }),
            ],
        });
        
        await processor.string(
            "./packages/paths/test/specimens/one/start.css",
            dedent(`
                @value sub from "./sub/sub.css";
                
                .rule {
                    composes: two from "two/two.css";
                }
            `)
        );

        const { compositions } = await processor.output();
        
        t.assert.snapshot(compositions);
    });
});
