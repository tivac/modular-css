"use strict";

var fs   = require("fs"),
    path = require("path"),

    postcss = require("postcss"),
    Graph   = require("dependency-graph").DepGraph,
    
    parser = postcss([
        require("./plugins/values.js"),
        require("./plugins/scoping.js"),
        require("./plugins/composition.js")
    ]),
    format = /(.+) from ["']([^'"]+?)["']$/i;

function parseImports(text) {
    var parts  = text.match(format),
        keys, source;
    
    if(!parts) {
        return false;
    }
    
    keys   = parts[1].split(",");
    source = parts[2];
    
    return {
        keys : keys.map(function(value) {
            return value.trim();
        }),
        
        source : source
    };
}

function parseFile(env, file) {
    var contents = fs.readFileSync(file, "utf8"),
        css      = postcss.parse(contents, { from : file });
    
    env.files[file] = {
        contents : contents
    };
    
    css.walkAtRules("value", function(rule) {
        var parsed = parseImports(rule.params),
            source;
        
        if(!parsed) {
            return;
        }
        
        source = path.resolve(env.root, parsed.source);
        
        env.graph.addNode(source);
        env.graph.addDependency(file, source);
    });
    
    css.walkDecls("composes", function(decl) {
        var parsed = parseImports(decl.value),
            source;
        
        if(!parsed) {
            return;
        }
        
        source = path.resolve(env.root, parsed.source);
        
        env.graph.addNode(source);
        env.graph.addDependency(file, source);
    });
    
    env.graph.dependenciesOf(file).forEach(function(dependency) {
        parseFile(env, dependency);
    });
}

module.exports.process = function(start, options) {
    var opts   = options || false,
        files  = {},
        graph  = new Graph(),
        source = path.resolve(start),
        root   = opts.root || path.dirname(source) || process.cwd(),
        result = "";
    
    graph.addNode(source);
    
    parseFile({
        graph : graph,
        files : files,
        root  : root
    }, source);
    
    graph.overallOrder().forEach(function(file) {
        var parsed = parser.process(files[file].contents, {
                from  : file,
                root  : root,
                files : files
            });
        
        parsed.messages.forEach(function(msg) {
            if(msg.values) {
                files[file].values = msg.values;
            } else if(msg.compositions) {
                files[file].classes = msg.compositions;
            }
        });
        
        result += parsed.css + "\n";
    });
    
    return result;
};

module.exports.parse  = parseImports;
module.exports.format = format;
