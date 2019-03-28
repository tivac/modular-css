"use strict";

const { toMatchSnapshot } = require("jest-snapshot");

expect.extend({
    toMatchRollupSnapshot({ output }, name = "") {
        const out = Object.create(null);
        
        output.forEach(({ code, isAsset, fileName, source }) => {
            // Leading newline to make diffs easier to read
            out[fileName] = `\n${isAsset ? source : code}`;
        });

        return toMatchSnapshot.call(
            this,
            out,
            name,
        );
    },
});
