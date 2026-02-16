const { describe, it, beforeEach } = require("node:test");

const { DepGraph } = require("dependency-graph");

const namer    = require("@modular-css/test-utils/namer.js");
const relative = require("@modular-css/test-utils/relative.js");
const Processor = require("../processor.js");

describe("/processor.js", () => {
    describe("getters", () => {
        let processor;
        
        beforeEach(() => {
            processor = new Processor({
                namer,
            });
        });
        
        describe(".file", () => {
            it("should return all the files that have been added", async (t) => {
                await processor.file("./packages/processor/test/specimens/start.css");
                await processor.file("./packages/processor/test/specimens/local.css");

                t.assert.snapshot(
                    relative(Object.keys(processor.files))
                );
            });
        });

        describe(".options", () => {
            it("should return the merged options object", (t) =>
                t.assert.strictEqual(typeof processor.options, "object")
            );
        });

        describe(".graph", () => {
            it("should return the dependency graph for added CSS files", async (t) => {
                await processor.file("./packages/processor/test/specimens/start.css");
                await processor.file("./packages/processor/test/specimens/local.css");

                t.assert.ok(processor.graph instanceof DepGraph);
            });
        });
    });
});
