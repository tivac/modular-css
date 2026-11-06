import { resolve } from "path";

import mcss from "@modular-css/vite";

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
                static  : resolve(import.meta.dirname, "./packages/vite/tests/specimens/static/index.html"),
                dynamic : resolve(import.meta.dirname, "./packages/vite/tests/specimens/dynamic/index.html"),
            },
        },
    },
};
