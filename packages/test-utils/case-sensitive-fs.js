"use strict";

let sensitive = false;

try {
    require.resolve(__filename.toUpperCase());
} catch(e) {
    sensitive = true;
}

module.exports = sensitive;
