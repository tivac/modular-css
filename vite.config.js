import mcss from "./packages/vite/vite.js";

/** @type {import('vite').UserConfig} */
export default {
    root : "./packages/vite/tests/specimens",
    clearScreen : false,

    plugins : [
        mcss({
            namer : (file, selector) => `mc_${selector}`,
        }),
    ],
};
