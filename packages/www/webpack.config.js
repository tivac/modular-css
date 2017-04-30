"use strict";

var path = require("path"),
    
    CSS = require("modular-css-webpack/plugin");

module.exports = {
    entry : "./index.js",

    output : {
        filename : "app.js",
        path     : path.resolve("./gen")
    },

    devtool : "cheap-source-map",
    
    module : {
        rules : [
            {
                test : /\.css$/,
                use  : "modular-css-webpack/loader"
            },
            {
                test : /\.js$/,
                use  : "buble-loader"
            }
        ]
    },
    
    plugins : [
        new CSS({
            css : "./app.css"
        })
    ],
    
    resolve : {
        alias : {
            fs : require.resolve("./fs-stub.js"),
            
            // TODO: is this gonna be a problem?
            module : require.resolve("./stub.js")
        }
    },

    devServer : {
        publicPath : "http://localhost:8080/gen/"
    },

    watchOptions : {
        ignored : /node_modules/
    }
};
