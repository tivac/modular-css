const valueParser = require("postcss-value-parser");

// eslint-disable-next-line no-empty-function -- chill
const noop = () => {};

const replacer = (thing, prop, values, matched = noop) => {
    const parseResult = valueParser(thing[prop]);
    
    let modified = false;

    parseResult.walk((node) => {
        if(node.type !== "word" || !values[node.value]) {
            return;
        }
        
        const current = values[node.value];
        
        // Source map support
        thing.source = current.source;

        // Replace any value instances
        node.value = current.value;

        modified = true;

        matched(node.value, current);
    });

    if(modified) {
        thing[prop] = parseResult.toString();
    }
};

module.exports = replacer;
