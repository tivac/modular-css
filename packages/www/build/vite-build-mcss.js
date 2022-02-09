import { createRequire } from "module";

import { rollup } from "rollup";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import nodePolyfills from "rollup-plugin-polyfill-node";

const require = createRequire(import.meta.url);

export default () => {
    const target = require.resolve("@modular-css/processor").replace(/\\/g, "/");

    let compiled;

    return {
        apply : "build",

        async load(id) {
            if(id !== target) {
                return null;
            }
            
            if(compiled) {
                return compiled;
            }
            
            const bundle = await rollup({
                input   : "@modular-css/processor",
                plugins : [
                    nodeResolve({
                        browser        : true,
                        preferBuiltins : false,
                    }),

                    commonjs(),

                    nodePolyfills({
                        include : null,
                    }),
                ],
            });

            const { output } = await bundle.generate({
                format : "esm",
            });

            compiled = {
                code : output[0].code,
                map  : { mappings : "" },
            };

            return compiled;
        },
    };
};
