"use strict";

const { init, parse } = require("es-module-lexer");
const parseImports = require("parse-es6-imports");

const scriptRegex = /<script[\S\s]*?>(?<contents>[\S\s]*?)<\/script>/gim;

// eslint-disable-next-line max-statements
exports.extractImport = async ({
    source,
    filename,
    processor,
    log,
    filter,
}) => {
    await init;

    const scripts = source.matchAll(scriptRegex);
    let href;
    let ident;

    for(const script of scripts) {
        if(!script) {
            continue;
        }

        const { contents } = script.groups;
        const [ imports ] = parse(contents);
    
        for(const { n : name, ss : start, se : end, d : dynamic } of imports) {
            if(!filter(name) || dynamic > -1) {
                continue;
            }
    
            const [ details ] = parseImports(contents.substring(start, end));
    
            href = name;
            ident = details.defaultImport;
    
            break;
        }

        if(href) {
            break;
        }
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
