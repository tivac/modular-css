import { resolve } from "path";

import mcss from "./packages/vite/vite.js";

/** @type {import('vite').UserConfig} */
export default {
    root : "./packages/vite/tests/specimens",

    clearScreen : false,

    plugins : [
        mcss({
            namer : (file, selector) => `mc_${selector}`,
            dev   : {
                coverage : true,
            },
        }),
    ],

    build : {
        minify : false,

        rollupOptions : {
            input : {
                static  : resolve(__dirname, "./packages/vite/tests/specimens/static/index.html"),
                dynamic : resolve(__dirname, "./packages/vite/tests/specimens/dynamic/index.html"),
            },
        },
    },
};
