"use strict";

var path = require("path"),
    
    postcss  = require("postcss"),
    Graph    = require("dependency-graph").DepGraph,
    slug     = require("unique-slug"),
    defaults = require("lodash.defaults"),
    
    relative = require("../lib/relative.js"),
    message  = require("../lib/message.js"),
    
    plugin = "modular-css-setup";

function namer(cwd, file, selector) {
    return "mc" + slug(relative(cwd, file)) + "_" + selector;
}

module.exports = (css, result) => {
    var opts = message(result, "options"),
        cwd  = opts.cwd || process.cwd(),
        options;
    
    // TODO: replace w/ lodash.defaults >:(
    options = defaults(
        Object.create(null),
        opts,
        {
            cwd   : cwd,
            namer : namer.bind(null, cwd),
            graph : new Graph(),
            files : Object.create(null)
        }
    );
    
    // Plugins to run before a file is processed
    options.before = postcss((options.before || []).concat([
        require("./options.js"),
        require("./values-local.js"),
        require("./values-export.js"),
        require("./values-replace.js"),
        require("./graph-nodes.js")
    ]));

    // Plugins to run after a file has been transformed
    options.after = postcss(options.after || [
        require("postcss-url")
    ]);

    if(options.from) {
        options.from = path.resolve(options.from);
    }

    result.messages.push({
        type : "modular-css",
        plugin,
        
        options
    });
};

module.exports.postcssPlugin = plugin;
