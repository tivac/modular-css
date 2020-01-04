"use strict";

const namer = require("@modular-css/test-utils/namer.js");
const relative = require("@modular-css/test-utils/relative.js");

const Processor = require("../processor.js");

describe("/processor.js", () => {
    describe(".resolve()", () => {
        let processor;

        beforeEach(() => {
            processor = new Processor({
                namer,
            });
        });

        it("should run resolvers until a match is found", () => {
            let ran = false;

            processor = new Processor({
                resolvers : [
                    () => {
                        ran = true;
                    },
                ],
            });

            expect(
                relative([
                    processor.resolve(
                        require.resolve("./specimens/start.css"),
                        "./local.css"
                    ),
                ])
            )
            .toMatchSnapshot();

            expect(ran).toBeTruthy();
        });

        it("should fall back to a default resolver", () => {
            processor = new Processor({
                resolvers : [
                    () => undefined,
                ],
            });

            expect(
                relative([
                    processor.resolve(
                        require.resolve("./specimens/start.css"),
                        "./local.css"
                    ),
                ])
            )
            .toMatchSnapshot();
        });
    });
});
