import preprocessor from "@modular-css/svelte";
import aliases from "@modular-css/path-aliases";
import namer from "@modular-css/shortnames";
import postcssNested from "postcss-nested";

const isProd = process.env.NODE_ENV === "production";

// Set up the svelte preprocessor and get a reference to the
// mcss processor so we can pass it into the vite plugin
const { preprocess, processor } = preprocessor({
    // Default is .css but we need .mcss because of vite
    include : /\.mcss$/i,
    
    // These cause no end of warnings from the processor because
    // they don't make nice JS identifiers usually, so disabled
    exportGlobals : false,

    // Enable for debugging, but disabled because NOISY
    verbose : false,

    // TODO: disabled because weird stuff is happening on Netlify, maybe around file paths?
    // Crank down names in prod to be itty-bitty
    // namer : isProd ? namer() : null,

    // Bring sveltekit aliases into m-css
    resolvers : [
        aliases({
            aliases : {
                $lib : "./src/lib",
            },
        }),
    ],
    
    // I like nesting, so sue me
    before : [
        postcssNested(),
    ],
});

export { preprocess, processor };
