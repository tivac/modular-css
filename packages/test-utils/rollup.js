const rollupCode = ({ output }) => {
    const chunks = new Map();

    output.forEach(({ type, name, code }) => {
        if(type === "asset") {
            return;
        }

        chunks.set(name, `\n${code}`);
    });

    const out = Object.create(null);
    
    // Ensure out object is in a consistent order
    [ ...chunks.keys() ].sort().forEach((key) => {
        out[key] = chunks.get(key);
    });

    return out;
};

const rollupBundle = ({ output }, { asset = true, code = true } = false) => {
    const things = new Map();
    
    output.forEach(({ code : sourcecode, type, fileName, source }) => {
        if(type === "asset" && !asset) {
            return;
        }

        if(type !== "asset" && !code) {
            return;
        }

        // Leading newline to make diffs easier to read
        things.set(fileName, `\n${type === "asset" ? source : sourcecode}`);
    });
    
    const out = Object.create(null);

    // Ensure out object is in a consistent order
    [ ...things.keys() ].sort().forEach((key) => {
        out[key] = things.get(key);
    });

    return out;
};

const rollupAssets = ({ output }) => {
    const assets = new Map();
    
    output.forEach(({ type, fileName, source }) => {
        if(type !== "asset") {
            return;
        }
        
        assets.set(fileName, `\n${source}`);
    });
    
    const out = Object.create(null);

    // Ensure out object is in a consistent order
    [ ...assets.keys() ].sort().forEach((key) => {
        out[key] = assets.get(key);
    });
    
    return out;
};

module.exports = {
    rollupBundle,
    rollupCode,
    rollupAssets,
};
