// Shim out path.parse since the browser version of path is missing it
import path from "path";
import parse from "path-parse";

path.parse = parse;

import fs from "fs";
import m from "mithril";
import pkg from "modular-css-core/package.json";
import Clipboard from "clipboard";

import { default as state, createFile, output } from "./state.js";
import { process } from "./process.js";

import Errors from "./components/errors.js";
import Input from "./components/input.js";
import Editor from "./components/editor.js";

import css from "./style.css";

window.fs = fs;
window.m = m;

m.mount(document.body, {
    oninit() {
        var hash = location.hash.length ? location.hash.slice(1) : false,
            parsed;

        // No existing state, create a default file
        if(!hash) {
            createFile();

            return;
        }
        
        try {
            parsed = JSON.parse(atob(hash));

            parsed.forEach((file) => {
                state.files.push(file.name);

                fs.writeFileSync(file.name, file.css);
            });

            process();
        } catch(e) {
            state.error = e.stack;

            createFile();
        }

        // set up the clipboard.js watcher
        new Clipboard(".clipboard");
    },

    view : () => [
        m("div", { class : css.hd },
            m("h1", { class : css.title },
                m("a", { href : "https://github.com/tivac/modular-css" }, "modular-css"),
                " ",
                m("span", { class : css.subhead }, `v${pkg.version}`)
            ),
            m("a", {
                    class : css.chat,
                    href  : "https://gitter.im/modular-css/modular-css"
                },
                m("img", {
                    src : "https://img.shields.io/gitter/room/modular-css/modular-css.svg",
                    alt : "Gitter"
                })
            )
        ),

        m("div", { class : css.content },
            m("div", { class : css.files },
                m("div", { class : css.actions },
                    m("button", {
                        class   : css.add,
                        onclick : createFile
                    }, "Add file")
                ),

                state.files.map((file, idx) => m(Input, { idx }))
            ),

            m("div", { class : css.output },
                m("div", { class : css.actions },
                    m("button", {
                        class : css.copy,

                        // thanks, clipboard.js
                        "data-clipboard-text" : output()
                    }, "Copy Details")
                ),
                
                m(Errors),
                
                m("div", { class : css.pane },
                    m("div", { class : css.meta },
                        m("h3", { class : css.name }, "CSS Output")
                    ),

                    m(Editor, {
                        mode  : "text/css",
                        field : "css"
                    })
                ),

                m("div", { class : css.pane },
                    m("div", { class : css.meta },
                        m("h3", { class : css.name }, "JSON Output")
                    ),

                    m(Editor, {
                        mode  : "application/json",
                        field : "json"
                    })
                )
            )
        )
    ]
});
