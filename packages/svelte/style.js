"use strict";

const { replaceTrailingNewlines } = require("./replacer.js");

const styleRegex = /<style[^>]*?type=['"]text\/m-css['"][^>]*?>([\S\s]+?)<\/style>/im;

exports.extractStyle = async ({ source, file, filename, processor, log }) => {
    styleRegex.lastIndex = 0;

    const style = source.match(styleRegex);

    if(!style) {
        return false;
    }
    
    log("extract <style>", file);

    if(processor.has(filename)) {
        processor.invalidate(filename);
    }

    let result;

    try {
        result = await processor.string(
            filename,
            style[1]
        );
    } catch(e) {
        e.message = e.toString();

        throw e;
    }

    source = replaceTrailingNewlines(source, style[0]);

    return {
        source,
        result,
        css          : "<style>",
        dependencies : [],
    };
};
