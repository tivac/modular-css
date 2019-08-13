"use strict";

const { toMatchSnapshot } = require("jest-snapshot");

expect.extend({
    toMatchRollupAssetSnapshot({ output }) {
        const assets = new Map();
        
        output.forEach(({ isAsset, fileName, source }) => {
            if(!isAsset) {
                return;
            }
            
            assets.set(fileName, `\n${source}`);
        });
        
        const out = Object.create(null);

        // Ensure out object is in a consistent order
        [ ...assets.keys() ].sort().forEach((key) => {
            out[key] = assets.get(key);
        });

        return toMatchSnapshot.call(
            this,
            out,
        );
    },
});
