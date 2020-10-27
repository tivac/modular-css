"use strict";

const { processor, preprocess } = require("@modular-css/svelte")({ verbose : true });

module.exports = {
    devOptions : {
        open : "none",
        output : "stream",
    },

    plugins : [
        [ "@modular-css/snowpack", { processor } ],
        [ "@snowpack/plugin-svelte", { preprocess } ],
    ],
};
