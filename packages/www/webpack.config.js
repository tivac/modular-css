"use strict";

var path = require("path"),
    
    CSS = require("modular-css-webpack/plugin");

module.exports = (env) => ({
    entry : "./index.js",

    output : {
        filename : "app.js",
        path     : path.resolve(env === "dist" ? "./dist" : "./gen")
    },

    devtool : "cheap-source-map",
    
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
        new CSS({
            css  : "./app.css",
            done : [
                env === "dist" ?
                    require("cssnano")() :
                    () => {} // eslint-disable-line
            ]
        })
    ],
    
    resolve : {
        alias : {
            fs     : require.resolve("./stubs/fs.js"),
            module : require.resolve("./stubs/generic.js")
        }
    },

    devServer : {
        publicPath : "http://localhost:8080/gen/"
    },

    watchOptions : {
        ignored : /node_modules/
    }
});
