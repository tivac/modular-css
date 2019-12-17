"use strict";

const fs = require("fs");
const postcss = require("postcss");
const read    = require("@modular-css/test-utils/read.js")(__dirname);
const namer   = require("@modular-css/test-utils/namer.js");
const plugin  = require("../postcss.js");

function process(file, opts = {}) {
    return plugin.process(
        fs.readFileSync(file),
        {
            __proto__ : null,

            from : file,
            namer,
            ...opts,
        }
    );
}

describe("/postcss.js", () => {
    afterAll(() => require("shelljs").rm("-rf", "./packages/postcss/test/output/*"));
    
    it("should be a function", () => {
        expect(typeof plugin).toBe("function");
    });

    it("should process CSS and output the result", async () => {
        const { css } = await process("./packages/postcss/test/specimens/simple.css");
        
        expect(css).toMatchSnapshot();
    });

    it("should process CSS with dependencies and output the result", async () => {
        const { css } = await process("./packages/postcss/test/specimens/start.css");
        
        expect(css).toMatchSnapshot();
    });

    it("should process CSS and output exports as a message", async () => {
        const { messages } = await process("./packages/postcss/test/specimens/simple.css");
        
        expect(messages).toMatchSnapshot();
    });

    it("should accept normal processor options", async () => {
        const { css } = await process("./packages/postcss/test/specimens/simple.css", {
            map : {
                inline : true,
            },
            namer : (f, s) => `fooga_${s}`,
        });
    
        expect(css).toMatchSnapshot();
    });

    it("should accept a `json` property and write exports to that file", async () => {
        await process(
            "./packages/postcss/test/specimens/start.css",
            {
                json : "./packages/postcss/test/output/classes.json",
            }
        );
        
        expect(read("classes.json")).toMatchSnapshot();
    });

    it("should use output filepath for json if a custom path isn't provided", async () => {
        await process(
            "./packages/postcss/test/specimens/start.css",
            {
                json : true,
                to   : "./packages/postcss/test/output/start.css",
            }
        );
        
        expect(read("start.json")).toMatchSnapshot();
    });

    it("should be usable like a normal postcss plugin", async () => {
        const processor = postcss([
            plugin({
                namer : () => "a",
            }),
        ]);
        
        const { css } = await processor.process(
            fs.readFileSync("./packages/postcss/test/specimens/simple.css"),
            {
                from : "./packages/postcss/test/specimens/simple.css",
                map  : {
                    inline : true,
                },
            }
        );
    
        expect(css).toMatchSnapshot();
    });

    it("should output json when used within postcss", async () => {
        const processor = postcss([
            plugin({
                namer,
            }),
        ]);
        
        await processor.process(
            fs.readFileSync("./packages/postcss/test/specimens/simple.css"),
            {
                from : "./packages/postcss/test/specimens/simple.css",
                json : "./packages/postcss/test/output/simple.json",
            }
        );
        
        expect(read("simple.json")).toMatchSnapshot();
    });

    it("should accept json args in either position with postcss", async () => {
        const processor = postcss([
            plugin({
                namer,
                json : "./packages/postcss/test/output/simple.json",
            }),
        ]);
        
        await processor.process(
            fs.readFileSync("./packages/postcss/test/specimens/simple.css"),
            {
                from : "./packages/postcss/test/specimens/simple.css",
            }
        );

        expect(read("simple.json")).toMatchSnapshot();
    });
});
