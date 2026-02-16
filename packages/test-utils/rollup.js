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

module.exports = {
    rollupBundle,
};
