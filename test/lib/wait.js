"use strict";
    
var chokidar = require("chokidar"),
    
    Promise = require("../../src/_promise");
    
module.exports = function(file) {
    return new Promise(function(resolve, reject) {
        var watcher = chokidar.watch(file);
        
        function done() {
            watcher.close();
            
            return resolve(file);
        }
        
        watcher.on("add", done);
        watcher.on("change", done);
        watcher.on("error", reject);
    });
};
