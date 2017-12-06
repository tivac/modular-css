"use strict";

var fs = require("fs"),

    rollup  = require("rollup").rollup,
    
    read  = require("test-utils/read.js")(__dirname),
    namer = require("test-utils/namer.js"),
    
    plugin = require("../svelte.js");

describe("/svelte.js", () => {
    afterEach(() => require("shelljs").rm("-rf", "./packages/rollup/test/output/*"));
    
    it("should generate exports", () =>
        rollup({
            input   : require.resolve("./specimens/svelte.html"),
            plugins : [
                require("rollup-plugin-svelte")(
                    plugin({
                        css : "./packages/rollup/test/output/svelte.css"
                    })
                )
            ]
        })
        .then((bundle) => bundle.generate({ format : "es" }))
        .then((result) => expect(result.code).toMatchSnapshot())
    );
});
