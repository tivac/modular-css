"use strict";

const utils       = require("loader-utils");
const { keyword } = require("esutils");

const output = require("@modular-css/processor/lib/output.js");

const DEFAULTS = {
    styleExport   : true,
    namedExports  : true,
    defaultExport : true,
};

// Can't be an arrow function due to `this` usage :(
module.exports = async function(source) {
    const options   = {
        __proto__ : null,
        ...DEFAULTS,
        ...utils.getOptions(this),
    };

    const done = this.async();
    const processor = this.options ?
        // Webpack 2 & 3
        this.options.processor :
        // Webpack 4
        this._compiler.options.processor;

    if(options.cjs) {
        this.emitWarning(
            new Error("cjs option is deprecated, used namedExports: false instead")
        );
    }

    this.cacheable();

    try {
        const { details } = await processor.string(this.resourcePath, source);
        const exported = output.fileCompositions(details, processor, { joined : true });
        const values = output.values(details.values);

        exported.$values = values;

        const out = [];

        if(options.defaultExport) {
            out.push(`export default ${JSON.stringify(exported, null, 4)};`);
        }

        processor.dependencies(this.resourcePath).forEach(this.addDependency);

        // Just default object export in this case
        if(!options.namedExports) {
            return done(null, out.join("\n"));
        }

        // Warn if any of the exported CSS wasn't able to be used as a valid JS identifier
        // and exclude from the output
        Object.keys(exported).forEach((ident) => {
            if(keyword.isReservedWordES6(ident) || !keyword.isIdentifierNameES6(ident)) {
                this.emitWarning(new Error(`Invalid JS identifier "${ident}", unable to export`));

                return;
            }

            out.push(`export var ${ident} = ${JSON.stringify(exported[ident])};`);
        });

        if(options.styleExport) {
            out.push(`export var styles = ${JSON.stringify(details.result.css)};`);
        }

        return done(null, out.join("\n"));
    } catch(e) {
        return done(e);
    }
};
