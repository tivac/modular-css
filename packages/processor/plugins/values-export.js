"use strict";

const order = [
    "modular-css-values-imported",
    "modular-css-values-local",
    "modular-css-values-composed",
];

// Find messages from other value plugins & save them to files object
module.exports = (css, { opts, messages }) => {
    const { files, from } = opts;
    const file = files[from];

    const values = messages
        .filter(({ plugin }) => plugin && order.indexOf(plugin) > -1)
        .sort((a, b) => order.indexOf(a.plugin) - order.indexOf(b.plugin))
        .reduce((prev, curr) => Object.assign(prev, curr.values), Object.create(null));
    
    file.values = {
        __proto__ : null,
        
        ...values,
        ...(file.values || {}),
    };
};

module.exports.postcssPlugin = "modular-css-values-export";
