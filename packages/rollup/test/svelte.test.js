"use strict";

var fs = require("fs"),

    rollup  = require("rollup").rollup,
    
    read  = require("test-utils/read.js")(__dirname),
    namer = require("test-utils/namer.js"),
    
    svelte = require("../svelte.js");

describe("/svelte.js", () => {
    afterEach(() => require("shelljs").rm("-rf", "./packages/rollup/test/output/*"));
    
    it("should generate exports", () => {
        const parts = svelte({
            css : "./packages/rollup/test/output/svelte.css"
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
        .then((bundle) => bundle.generate({ format : "es" }))
        .then((result) => expect(result.code).toMatchSnapshot());
    });
});
