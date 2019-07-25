"use strict";

const { isProduction, isWatch, dest } = require("./build/environment.js");

// eslint-disable-next-line no-empty-function
const noop = () => {};

const { processor, preprocess } = require("@modular-css/svelte")({
    namer : isProduction && require("@modular-css/shortnames")(),

    before : [
        require("postcss-nested")(),
    ],
    
    after : [
        require("postcss-color-function")(),
        require("postcss-import")(),
        require("postcss-calc")(),
    ],

    done : [
        isProduction ? require("cssnano")() : noop,
    ],
});

const shared = (store) => {
    const prop = (...args) => {
        if(args.length) {
            store = args[0];
        }
        
        return store;
    };

    prop.toJSON = () => store;

    return prop;
};

const bundle = shared();

module.exports = [
    // CJS Build of home/guide for node generation
    {
        input : {
            api       : "./src/api/api.html",
            guide     : "./src/guide/guide.html",
            home      : "./src/home/home.html",
            repl      : "./src/repl/index.html",
            changelog : "./src/changelog/changelog.html",
        },

        // Don't need to bundle any of this, so purposefully exclude it
        external : [
            "fs",
            "path",
            "crypto",
            "module",
            "postcss",
            "@modular-css/processor",
            "lznext",
        ],

        output : {
            dir    : dest,
            format : "cjs",

            sourcemap : false,

            entryFileNames : "[name].js",
            chunkFileNames : "[name].[format].js",
        },

        plugins : [
            // Wipe the destination dir on each rebuild
            require("./build/rollup-plugin-clean")(),


            require("./build/rollup-plugin-add-watch-files.js")(),

            require("rollup-plugin-node-resolve")({
                preferBuiltins : false,
            }),

            require("./build/rollup-plugin-md.js")(),
            
            require("rollup-plugin-commonjs")(),
            require("rollup-plugin-json")(),
            
            require("rollup-plugin-svelte")({
                preprocess,
                generate : "ssr",
            }),

            require("@modular-css/rollup")({
                processor,
            }),

            // Weird little inline plugin to make the previous bundle available
            // to the next build. Needed so it can figure out what this build named files.
            {
                name : "rollup-plugin-sharing",
                generateBundle(options, chunks) {
                    bundle(chunks);
                },
            },

            // Start a local server if in watch mode
            isWatch && require("./build/rollup-plugin-sirv.js")(),

            // Compress JS in production mode
            isProduction && require("rollup-plugin-terser").terser(),
        ],
    },
    // Browser build of the REPL
    {
        input : {
            repl : "./src/repl/index.js",
            
            // Including to force the CSS to be split apart so the REPL CSS
            // doesn't duplicate things it doesn't need to
            page : "./src/page.html",
        },

        output : {
            dir    : dest,
            format : "esm",

            sourcemap : true,

            entryFileNames : "[name]-[hash].js",
        },

        plugins : [
            require("rollup-plugin-alias")({
                fs   : require.resolve("./stubs/fs.js"),
                path : require.resolve("./stubs/path.js"),
            }),

            require("rollup-plugin-node-resolve")({
                mainFields : [ "module", "browser", "main" ],

                preferBuiltins : false,
            }),
            
            // Run webpack INSIDE ROLLUP to bundle postcss because it's fuckered otherwise
            require("./build/rollup-plugin-postcss.js")(),
            
            require("rollup-plugin-commonjs")(),
            require("rollup-plugin-node-globals")(),
            require("rollup-plugin-node-builtins")(),
            require("rollup-plugin-json")(),
            
            require("rollup-plugin-svelte")({
                preprocess,
            }),

            require("@modular-css/rollup")({
                processor,
            }),

            // Generate HTML for all the static pages
            require("./build/rollup-plugin-generate-html.js")({ bundle }),
        ],
    },
];
