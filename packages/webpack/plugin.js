"use strict";

const { sources } = require("webpack");

const Processor = require("@modular-css/processor");

const PLUGIN_NAME = "@modular-css/webpack";

class ModularCSS {
    constructor(args) {
        var options = {
            __proto__ : null,
            ...args,
        };

        this.prev = {};
        this.processor = options.processor || new Processor(options);
        this.options = options;
    }

    apply(compiler) {
        // File invalidated by webpack watcher
        compiler.hooks.invalid.tap(PLUGIN_NAME, (file) => {
            if(this.processor.has(file)) {
                this.processor.invalidate(file);
            }
        });

        // Runs before compilation begins
        compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
            // Make processor instance available to the loader
            compilation.options.processor = this.processor;

            // TODO: Figure out how to tell what files might have changed
            // This code is only useful when calling .run() multiple times
            // watching handles its own invalidations
            // if(compiler.modifiedFiles || compiler.removedFiles) {
            //     compiler.modifiedFiles.forEach((file) => this.processor.invalidate(file));
            //     compiler.removedFiles.forEach((file) => this.processor.remove(file));
            // }
        });

        compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
            compilation.hooks.processAssets.tapPromise({
                name  : PLUGIN_NAME,
                stage : compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
            }, async (assets) => {
                // Don't even bother if errors happened
                if(compilation.errors.length) {
                    return;
                }
    
                const data = await this.processor.output({
                    to : this.options.css || false,
                });
    
                if(this.options.css) {
                    assets[this.options.css] = data.map ?
                        new sources.SourceMapSource(
                            data.css,
                            this.options.css,
                            data.map
                        ) :
                        new sources.RawSource(
                            data.css
                        );
    
                    // Write out external source map if it exists
                    if(data.map) {
                        assets[`${this.options.css}.map`] = new sources.RawSource(
                            data.map.toString()
                        );
                    }
                }
    
                if(this.options.json) {
                    assets[this.options.json] = new sources.RawSource(
                        JSON.stringify(data.compositions, null, 4)
                    );
                }
            });
        });
    }
}

module.exports = ModularCSS;
