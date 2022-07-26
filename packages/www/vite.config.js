import path from "path";

import { NodeModulesPolyfillPlugin as modulesPolyfill } from "@esbuild-plugins/node-modules-polyfill";
import mcss from "@modular-css/vite";
import { sveltekit } from "@sveltejs/kit/vite";

import viteMd from "./build/vite-md.js";
import viteBuildMcss from "./build/vite-build-mcss.js";
import { processor } from "./build/mcss-setup.js";

/** @type {import('vite').UserConfig} */
const config = {
	plugins : [
		sveltekit(),

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

	optimizeDeps : {
		// Required because npm workspaces use links, and vite
		// won't optimize linked packages by default
		include : [
			"@modular-css/processor",
		],

		// Teach esbuild how to bundle modular-css since it's CJS that assumes a node
		// environment, and by default esbuild chokes on it in devserver mode
		esbuildOptions : {
			plugins : [
				modulesPolyfill(),
			],
		},
	},

	server : {
		fs : {
			// See the allow list below for why this has to be disabled 😒
			strict : false,

			// This is configured but useless due to vite prepending all
			// these paths weirdly on windows. They come out like this:
			// /C:/Users/.../node_modules/@modular-css/CHANGELOG.md which is.... never
			// gonna match anything on windows.
			allow : [
				path.resolve("./package.json"),
				path.resolve("../../CHANGELOG.md"),
			],
		},
	},
};

export default config;
