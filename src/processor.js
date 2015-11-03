"use strict";

var fs   = require("fs"),
    path = require("path"),

    postcss = require("postcss"),
    Graph   = require("dependency-graph").DepGraph,
    resolve = require("resolve"),
    
    parser = postcss([
        require("./plugins/values.js"),
        require("./plugins/scoping.js"),
        require("./plugins/composition.js")
    ]),
    
    imports = require("./imports");

function parseFile(env, file, contents) {
    var basedir = path.dirname(file),
        css     = postcss.parse(contents, { from : file });
    
    function parse(field, rule) {
        var parsed = imports.parse(rule[field]),
            source;
        
        if(!parsed) {
            return;
        }
        
        source = resolve.sync(parsed.source, { basedir : basedir });
        
        env.graph.addNode(source);
        env.graph.addDependency(file, source);
    }
    
    env.files[file] = {
        contents : contents
    };
    
    css.walkAtRules("value", parse.bind(null, "params"));
    css.walkDecls("composes", parse.bind(null, "value"));
    
    env.graph.dependenciesOf(file).forEach(function(dependency) {
        parseFile(env, dependency, fs.readFileSync(dependency, "utf8"));
    });
}

exports.file = function(file) {
    return exports.string(file, fs.readFileSync(file, "utf8"));
};

exports.string = function(start, contents) {
    var files  = {},
        graph  = new Graph(),
        source = path.resolve(start),
        result = "";

    graph.addNode(source);
    
    parseFile({
        graph : graph,
        files : files
    }, source, contents);
    
    graph.overallOrder().forEach(function(file) {
        var parsed = parser.process(files[file].contents, {
                from  : file,
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
    
    return {
        css     : result,
        files   : files,
        exports : files[source].classes
    };
};

