const root = process.cwd().replace(/\\/g, "/");
const safe = "<ROOT-DIR>";

const stringSerializer = [ (value) => {
    if(typeof value !== "string") {
       value = JSON.stringify(value, null, 2); 
    }
    
    value = value.replaceAll(root, safe);

    return value;
} ];

const rollupSerializer = [ (value) => {
    let out = [];

    for(const key in value) {
        out.push(`File: ${key}`, `Value:${value[key]}`);
    }

    return out.join("\n");
} ];

module.exports = {
    stringSerializer,
    rollupSerializer,
};
