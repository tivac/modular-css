"use strict";

const { init, parse } = require("es-module-lexer");
const parseImports = require("parse-es6-imports");

const scriptRegex = /<script[\S\s]*?>([\S\s]*?)<\/script>/im;

// eslint-disable-next-line max-statements
exports.extractImport = async ({
    source,
    filename,
    processor,
    log,
    filter,
}) => {
    await init;

    const script = source.match(scriptRegex);
    
    if(!script) {
        return false;
    }

    const [ , contents ] = script;
    const [ imports ] = parse(contents);
    let href;
    let ident;

    for(const { n : name, ss : start, se : end, d : dynamic } of imports) {
        if(!filter(name) || dynamic > -1) {
            continue;
        }

        const [ details ] = parseImports(contents.substring(start, end));

        href = name;
        ident = details.defaultImport;

        break;
    }

    if(!href) {
        return false;
    }

    const external = processor.resolve(filename, href);

    log("import", external, ident);

    if(processor.has(external)) {
        processor.invalidate(external);
    }

    let result;

    try {
        // Process the file
        result = await processor.file(external);
    } catch(e) {
        e.message = e.toString();

        throw e;
    }

    return {
        ident,
        source,
        result,
        css          : href,
        dependencies : [ ...processor.fileDependencies(external), external ],
    };
};
