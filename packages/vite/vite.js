"use strict";

const path = require("path");

const utils = require("@rollup/pluginutils");
const dedent = require("dedent");

const Processor = require("@modular-css/processor");
const { transform } = require("@modular-css/css-to-js");

const { fileKey, filterByPrefix, FILE_PREFIX } = Processor;

// sourcemaps for css-to-js don't make much sense, so always return nothing
// https://github.com/rollup/rollup/wiki/Plugins#conventions
const emptyMappings = {
    mappings : "",
};

const DEFAULTS = {
    verbose : false,

    // Regexp to work around https://github.com/rollup/rollup-pluginutils/issues/39
    include : /\.mcss$/i,
};

const CSS_QUERY = "mcss&type=style&lang.css";

const normalize = (file) => file.replace(/\/|\\/g, path.sep);
const slash = (file) => file.replace(/\\/g, "/");
const virtualize = (file) => `${file}?${CSS_QUERY}`;
const devirtualize = (file) => `${file.split("?")[0]}`;
const isVirtual = (file) => file.endsWith(`?${CSS_QUERY}`);

module.exports = (
    /* istanbul ignore next: too painful to test */
    pluginOptions = {}
) => {
    const options = {
        __proto__ : null,
        ...DEFAULTS,
        ...pluginOptions,
    };

    const {
        processor = new Processor(options),
    } = options;

    const filter = utils.createFilter(options.include, options.exclude);

    const { graph } = processor;

    // eslint-disable-next-line no-console, no-empty-function -- logging is fine chill out
    const log = options.verbose ? console.log.bind(console, "[@mcss/vite]") : () => { };

    // istanbul ignore if: too hard to test this w/ defaults
    if(typeof options.map === "undefined") {
        // Sourcemaps default to true otherwise
        options.map = true;
    }

    let viteServer;
    let viteConfig;

    const watchFile = (file) => {
        const slashed = slash(file);

        if(viteServer) {
            viteServer.watcher.add(slashed);
        } else if(viteConfig.build.watch) {
            this.addWatchFile(slashed);
        }
    };

    return {
        name    : "@modular-css/vite",
        enforce : "pre",

        configResolved(config) {
            viteConfig = config;
        },

        configureServer(instance) {
            viteServer = instance;

            viteServer.watcher.on("change", (file) => {
                log("change", file);
                
                if(!processor.has(file)) {
                    return;
                }

                processor.invalidate(file);

                // Make sure vite knows that our dependencies might've changed too
                processor.fileDependencies(file).forEach((dep) => {
                    viteServer.watcher.emit("change", dep);
                });
            });

            viteServer.watcher.on("unlink", (file) => {
                if(!processor.has(file)) {
                    return;
                }

                // Have to grab deps _before_ removal
                const deps = processor.fileDependencies(file);
                
                processor.remove(file);
                
                // Invalidate dependencies of the file that was removed
                deps.forEach((dep) => {
                    viteServer.watcher.emit("change", dep);
                });
            });
        },

        buildStart() {
            log("build start");

            // Watch any files already in the procesor
            Object.keys(processor.files).forEach((file) => watchFile(file));
        },

        async resolveId(source) {
            // Only care about our particular type of virtual file
            if(!isVirtual(source)) {
                return null;
            }

            log("resolving", source);

            let resolved = source;
            
            // Check file as passed (minus the query params)
            if(processor.has(devirtualize(resolved))) {
                return resolved;
            }

            resolved = path.join(process.cwd(), resolved);

            // Check file as an asbolute path (minus the query params)
            if(!processor.has(devirtualize(resolved))) {
                return null;
            }

            resolved = slash(resolved);

            log("resolved", source, "to", resolved);

            return resolved;
        },

        // Load the virtual CSS files
        async load(id, opts = false) {
            log("load", id);

            // Only want this to run for the virtual CSS modules
            if(!isVirtual(id)) {
                return null;
            }

            log("loading", id);

            const file = devirtualize(id);

            if(!processor.has(file)) {
                return null;
            }

            if(viteServer) {
                const node = await viteServer.moduleGraph.ensureEntryFromUrl(id);
                const deps = graph.directDependenciesOf(fileKey(normalize(file)));
                const imported = filterByPrefix(FILE_PREFIX, deps).map((dep) => virtualize(slash(dep)));

                await Promise.all(imported.map((dep) => viteServer.moduleGraph.ensureEntryFromUrl(dep)));

                log("load deps", id, "=>", imported);

                const hmrDeps = imported;

                await viteServer.moduleGraph.updateModuleInfo(
                    node,
                    new Set(imported),
                    null,
                    new Set(hmrDeps),
                    null,
                    true,
                    Boolean(opts.ssr),
                );
            }

            const result = await processor.output({
                files : [ file ],
            });

            log("loaded", id, "\n", result.css);

            return result.css;
        },

        // Convert .mcss files to .js files
        async transform(code, id) {
            log("transform", id);

            if(!filter(id)) {
                return null;
            }

            const file = normalize(id);

            log("transforming", file);

            try {
                await processor.string(file, code);
            } catch(e) {
                // Replace the default message with the much more verbose one
                e.message = e.toString();

                return this.error(e);
            }

            const { code : css, namedExports, warnings } = transform(file, processor, pluginOptions);

            warnings.forEach((warning) => {
                this.warn(warning);
            });

            const deps = processor.fileDependencies(file);

            deps.forEach((dep) => watchFile(dep));

            // TODO: Gets CSS order right by forcing them to load their dependent CSS first.
            // Feels very brittle and overkill, but this is what we've got for now
            const result = dedent(`
                ${deps.map((dep) => `import "${virtualize(slash(dep))}";`).join("\n")}
                import "${virtualize(id)}";

                ${css}
            `);

            // TODO: Doesn't get CSS order right, but the previous one makes for a weird-looking graph
            // const result = dedent(`
            //     import "${virtualize(id)}";

            //     ${css}
            // `);

            log("transformed", id, "\n", result);

            // Return JS representation to vite
            return {
                code : result,
                map  : emptyMappings,

                // Disable tree-shaking for CSS modules w/o any classes/values to export
                // to make sure they're included in the bundle
                moduleSideEffects : namedExports.length || "no-treeshake",
            };
        },
    };
};
