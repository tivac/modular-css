"use strict";

const order = [
    "modular-css-values-imported",
    "modular-css-values-local",
    "modular-css-values-composed",
];

// Find messages from other value plugins & save them to files object
module.exports = (css, result) => {
    const file = result.opts.files[result.opts.from];

    const values = result.messages
        .filter((msg) => msg.plugin && order.indexOf(msg.plugin) > -1)
        .sort((a, b) => order.indexOf(a.plugin) - order.indexOf(b.plugin))
        .reduce((prev, curr) => Object.assign(prev, curr.values), Object.create(null));
    
    file.values = Object.assign(Object.create(null), values, file.values || {});
};

module.exports.postcssPlugin = "modular-css-values-export";
