"use strict";

const { toMatchSnapshot } = require("jest-snapshot");

expect.extend({
    toMatchRollupAssetSnapshot({ output }) {
        const out = Object.create(null);
        
        output.forEach(({ isAsset, fileName, source }) => {
            if(!isAsset) {
                return;
            }

            out[fileName] = `\n${source}`;
        });

        return toMatchSnapshot.call(
            this,
            out,
        );
    },
});
