"use strict";

const { dedent } = require("dentist");
    
const Processor = require("@modular-css/processor");
const namer     = require("@modular-css/test-utils/namer.js");

const aliases = require("../aliases.js");

describe("@modular-css/path-aliases", () => {
    it("should return a falsey value if a file isn't found", () => {
        const fn = aliases({
            aliases : {
                specimens : "./packages/aliases/test/specimens",
            },
        });

        expect(fn(".", "specimens/fooga.css")).toBeFalsy();
    });

    it("should return the absolute path if a file is found", () => {
        const fn = aliases({
            aliases : {
                one : "./packages/aliases/test/specimens/one",
            },
        });

        expect(fn(".", "one/one.css")).toBe(require.resolve("./specimens/one/one.css"));
    });

    it("should check multiple aliases for files & return the first match", () => {
        const fn = aliases({
            aliases : {
                one : "./packages/aliases/test/specimens/one",
                two : "./packages/aliases/test/specimens/two",
                sub : "./packages/aliases/test/specimens/one/sub",
            },
        });

        expect(fn(".", "one/one.css")).toBe(require.resolve("./specimens/one/one.css"));
        expect(fn(".", "sub/sub.css")).toBe(require.resolve("./specimens/one/sub/sub.css"));
    });

    it("should be usable as a modular-css resolver", () => {
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
        
        return processor.string(
            "./packages/paths/test/specimens/one/start.css",
            dedent(`
                @value sub from "sub/sub.css";
                
                .rule {
                    composes: two from "two/two.css";
                }
            `)
        )
        .then(() => processor.output())
        .then(({ compositions }) => expect(compositions).toMatchSnapshot()
        );
    });

    it("should fall through to the default resolver", () => {
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
        
        return processor.string(
            "./packages/paths/test/specimens/one/start.css",
            dedent(`
                @value sub from "./sub/sub.css";
                
                .rule {
                    composes: two from "two/two.css";
                }
            `)
        )
        .then(() => processor.output())
        .then(({ compositions }) => expect(compositions).toMatchSnapshot()
        );
    });
});
