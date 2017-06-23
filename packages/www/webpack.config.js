"use strict";

var path = require("path"),

    webpack = require("webpack"),

    Cleanup = require("webpack-cleanup-plugin"),
    HTML    = require("html-webpack-plugin"),
    
    CSS = require("modular-css-webpack/plugin");

module.exports = (env) => ({
    entry   : "./index.js",
    devtool : "cheap-source-map",
    output  : {
        path     : path.resolve("./gen"),
        filename : "app.js"
    },
    
    module : {
        rules : [
            {
                test : /\.css$/,
                use  : {
                    loader  : "modular-css-webpack/loader",
                    options : {
                        namedExports : false
                    }
                }
            },
            {
                test : /\.js$/,
                use  : "buble-loader"
            }
        ]
    },
    
    plugins : [
        new Cleanup({
            exclude : [
                ".gitignore"
            ]
        }),

        env === "dist" ?
            new webpack.optimize.ModuleConcatenationPlugin() :
            () => {}, // eslint-disable-line

        new CSS({
            css : "./app.css",
            
            namer : env === "dist" ?
                 require("modular-css-namer")() :
                 null,
            
            done : env === "dist" ?
                // can't use cssnanountil v4 is out :(
                // [ require("cssnano")() ] :
                [] : []
        }),

        new HTML({
            template : "./index.ejs",
            inject   : true
        })
    ],
    
    resolve : {
        alias : {
            fs     : require.resolve("./stubs/fs.js"),
            module : require.resolve("./stubs/generic.js")
        }
    },

    watchOptions : {
        ignored : /node_modules/
    },

    devServer : {
        compress   : true,
        publicPath : "http://localhost:8080/"
    }
});
