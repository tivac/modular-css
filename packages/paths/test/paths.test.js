"use strict";

const { dedent } = require("dentist");
const Processor = require("@modular-css/processor");
const namer     = require("@modular-css/test-utils/namer.js");
const paths = require("../paths.js");

describe("@modular-css/path-resolver", () => {
    it("should return a falsey value if a file isn't found", () => {
        const fn = paths({
            paths : [
                "./packages/paths/test/specimens",
            ],
        });

        expect(fn(".", "./fooga.css")).toBeFalsy();
    });

    it("should return the absolute path if a file is found", () => {
        const fn = paths({
            paths : [
                "./packages/paths/test/specimens/one",
            ],
        });

        expect(fn(".", "./one.css")).toBe(require.resolve("./specimens/one/one.css"));
    });

    it("should check multiple paths for files & return the first match", () => {
        const fn = paths({
            paths : [
                "./packages/paths/test/specimens/one",
                "./packages/paths/test/specimens/one/sub",
            ],
        });

         expect(fn(".", "./sub.css")).toBe(require.resolve("./specimens/one/sub/sub.css"));
    });

    it("should be usable as a modular-css resolver", () => {
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
        
        return processor.string(
            "./packages/paths/test/specimens/one/start.css",
            dedent(`
                @value sub from "./sub.css";
                
                .rule {
                    composes: two from "./two.css";
                }
            `)
        )
        .then(() => processor.output())
        .then(({ compositions }) => expect(compositions).toMatchSnapshot());
    });
});
