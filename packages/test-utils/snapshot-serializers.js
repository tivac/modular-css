const root = process.cwd().replace(/\\/g, "/");
const safe = "<ROOT-DIR>";

const stringSerializer = [ (value) => {
    if(typeof value !== "string") {
       value = JSON.stringify(value, null, 2); 
    }
    
    value = value.replaceAll(root, safe);

    return value;
} ];

module.exports = {
    stringSerializer,
};
