import path from "path";

import staticAdapter from "@sveltejs/adapter-static";
import { sveltekit } from "@sveltejs/kit/vite";
import mcss from "@modular-css/vite";

import viteMd from "./build/vite-md.js";
import viteBuildMcss from "./build/vite-build-mcss.js";
import { preprocess, processor } from "./build/mcss-setup.js";

/** @type {import('vite').UserConfig} */ const config = {
  plugins: [
    sveltekit({
      // Pass the svelte preprocessor from @modular-css/svelte into sveltekit
      // so that it can make most CSS classes static and shrink the compiled
      // component code way down
      preprocess,

      // Default is "build" but I'm particular and prefer "dist"
      adapter: staticAdapter({ pages: "dist" }),

      prerender: {
        handleMissingId({ path, message }) {
          if (path === "/repl/") {
            return;
          }

          // eslint-disable-next-line no-console
          console.warn(path, message);
        },
      },
    }),

    // Bundle @modular-css/processor and its dependencies via
    // embedded rollup within rollup because vite doesn't handle
    // cjs modules and node globals very well
    viteBuildMcss(),

    // Bundle markdown documents
    viteMd(),

    // Bundle .mcss files
    mcss({
      processor,
    }),
  ],

  optimizeDeps: {
    // Required because npm workspaces use links, and vite
    // won't optimize linked packages by default
    include: ["@modular-css/processor"],
  },

  server: {
    fs: {
      // See the allow list below for why this has to be disabled 😒
      strict: false,

      // This is configured but useless due to vite prepending all
      // these paths weirdly on windows. They come out like this:
      // /C:/Users/.../node_modules/@modular-css/CHANGELOG.md which is.... never
      // gonna match anything on windows.
      allow: [
        path.resolve("./package.json"),
        path.resolve("../../CHANGELOG.md"),
      ],
    },
  },
};

export default config;
