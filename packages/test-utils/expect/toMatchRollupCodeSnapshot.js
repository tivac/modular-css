"use strict";

const { toMatchSnapshot } = require("jest-snapshot");

expect.extend({
    toMatchRollupCodeSnapshot({ output }) {
        const out = Object.create(null);
        
        output.forEach((chunk) => {
            if(chunk.isAsset) {
                return;
            }

            out[chunk.name] = chunk.code;
        });

        return toMatchSnapshot.call(
            this,
            out,
        );
    },
});
