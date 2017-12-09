"use strict";

var rollup  = require("rollup").rollup,
    
    read  = require("test-utils/read.js")(__dirname),
    namer = require("test-utils/namer.js"),
    
    svelte = require("../svelte.js");

describe("/svelte.js", () => {
    afterEach(() => require("shelljs").rm("-rf", "./packages/rollup/test/output/*"));
    
    it("should generate exports", () => {
        const parts = svelte({
            css : "./packages/rollup/test/output/svelte.css",
            namer
        });

        return rollup({
            input   : require.resolve("./specimens/svelte.html"),
            plugins : [
                require("rollup-plugin-svelte")({
                    preprocess : parts.preprocess
                }),
                parts.plugin
            ]
        })
        .then((bundle) => bundle.write({
            format : "es",
            file   : "./packages/rollup/test/output/svelte.js"
        }))
        .then(() => {
            expect(read("svelte.js")).toMatchSnapshot();
            expect(read("svelte.css")).toMatchSnapshot();
        });
    });
});
