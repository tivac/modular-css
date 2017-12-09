"use strict";

var rollup  = require("rollup").rollup,
    
    read  = require("test-utils/read.js")(__dirname),
    namer = require("test-utils/namer.js"),
    
    processor = require("../rollup.js");

describe("/rollup.js", () => {
    afterEach(() => require("shelljs").rm("-rf", "./packages/svelte/test/output/*"));
    
    it("should generate exports", () => {
        const{ preprocess, plugin } = processor({
            css : "./packages/svelte/test/output/svelte.css",
            namer
        });

        return rollup({
            input   : require.resolve("./specimens/svelte.html"),
            plugins : [
                require("rollup-plugin-svelte")({
                    preprocess
                }),
                plugin
            ]
        })
        .then((bundle) => bundle.write({
            format : "es",
            file   : "./packages/svelte/test/output/svelte.js"
        }))
        .then(() => {
            expect(read("svelte.js")).toMatchSnapshot();
            expect(read("svelte.css")).toMatchSnapshot();
        });
    });
});
