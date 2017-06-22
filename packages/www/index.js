// Shim out path.parse since the browser version of path is missing it
import path from "path";
import parse from "path-parse";

path.parse = parse;

import fs from "fs";
import m from "mithril";
import pkg from "modular-css-core/package.json";
import cm from "codemirror";
import Clipboard from "clipboard";

// Load up codemirror modes
import "codemirror/mode/css/css.js";
import "codemirror/mode/javascript/javascript.js";

import { default as state, createFile, output } from "./state.js";
import { process } from "./process.js";

import Tabs from "./components/tabs.js";
import Errors from "./components/errors.js";
import Input from "./components/input.js";

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
                    }, "Add file"),

                    m("button", {
                        class : css.export,
                        
                        // thanks, clipboard.js
                        "data-clipboard-text" : output()
                    }, "Copy Details")
                ),

                state.files.map((file, idx) => m(Input, { idx }))
            ),

            m("div", { class : css.output },
                m(Errors),
                m(Tabs, {
                    tabs : {
                        CSS : () => m("div", { class : css.panel },
                            m("textarea", {
                                oncreate : (vnode) => {
                                    vnode.state.editor = cm.fromTextArea(vnode.dom, {
                                        mode        : "text/css",
                                        theme       : "monokai",
                                        lineNumbers : true,
                                        readOnly    : "nocursor",
                                        value       : state.output.css
                                    });
                                },

                                onupdate : (vnode) => vnode.state.editor.doc.setValue(state.output.css)
                            })
                        ),
                        
                        JSON : () => m("div", { class : css.panel },
                            m("textarea", {
                                oncreate : (vnode) => {
                                    vnode.state.editor = cm.fromTextArea(vnode.dom, {
                                        mode        : "application/json",
                                        theme       : "monokai",
                                        lineNumbers : true,
                                        readOnly    : "nocursor",
                                        value       : state.output.json
                                    });
                                },

                                onupdate : (vnode) => vnode.state.editor.doc.setValue(state.output.json)
                            })
                        )
                    }
                })
            )
        )
    ]
});
