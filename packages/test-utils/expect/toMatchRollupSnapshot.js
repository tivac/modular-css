"use strict";

const { toMatchSnapshot } = require("jest-snapshot");

expect.extend({
    toMatchRollupSnapshot({ output }, name = "") {
        const things = new Map();
        
        output.forEach(({ code, type, fileName, source }) => {
            // Leading newline to make diffs easier to read
            things.set(fileName, `\n${type === "asset" ? source : code}`);
        });
        
        const out = Object.create(null);

        // Ensure out object is in a consistent order
        [ ...things.keys() ].sort().forEach((key) => {
            out[key] = things.get(key);
        });
        
        return toMatchSnapshot.call(
            this,
            out,
            name,
        );
    },
});
