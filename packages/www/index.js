"use strict";
import fs from "fs";
import Processor from "modular-css-core";
import m from "mithril";
import pkg from "modular-css-core/package.json";
import cm from "codemirror";
import throttle from "throttleit";

// Load up codemirror modes
import "codemirror/mode/css/css.js";
import "codemirror/mode/javascript/javascript.js";

import tabs from "./components/tabs.js";

import css from "./style.css";

var files = [],

    output = {
        css : "",
        js  : false
    },

    processor = new Processor({
        resolvers : [
            (src, file) => {
                file = file.replace(/^\.\.\/|\.\//, "");

                return `/${file}`;
            }
        ]
    }),
    
    tab = "CSS",
    
    error, throttled, state;

window.fs = fs;

function createFile() {
    var file = `/${files.length + 1}.css`;

    fs.writeFileSync(file, `\n`);
    
    files.push(file);
}

function process() {
    state = btoa(
        JSON.stringify(
            files.map((name) => ({
                name,
                css : fs.readFileSync(name, "utf8")
            }))
        )
    );

    m.route.set(`/?${m.buildQueryString({ state : state })}`);
    
    Promise.all(
        files.map((file) =>
            processor.file(file)
        )
    )
    .then(() => processor.output())
    .then((result) => {
        output.css  = result.css;
        output.json = JSON.stringify(result.compositions, null, 4);

        error = false;
        
        if(tab === "Errors") {
            tab = "CSS";
        }
    })
    .catch((e) => {
        error = e.toString();
        tab = "Errors";
    })
    .then(m.redraw);
}

function exported() {
    return `/* Input Files */\n\n${
    files
        .map((file) => `/* ${file} */\n${fs.readFileSync(file, "utf8")}`)
        .concat(
            output.css && `/* Output CSS */\n${output.css || ""}`,
            output.json && `/* Output JSON */\n${output.json || ""}`,
            error && `/* Error */\n${error}`
        )
        .filter(Boolean)
        .join("\n\n")}`;
}

throttled = throttle(process, 200);

m.route(document.body, "/", {
    "/" : {
        oninit : (vnode) => {
            var parsed;

            // No existing state, create a default file
            if(!vnode.attrs.state) {
                createFile();

                return;
            }
            
            try {
                parsed = JSON.parse(atob(vnode.attrs.state));

                parsed.forEach((file) => {
                    files.push(file.name);

                    fs.writeFileSync(file.name, file.css);
                });

                process();
            } catch(e) {
                error = "Unable to parse state";
            }
        },

        view : () => [
            m("div", { class : css.hd },
                m("h1", { class : css.title },
                    m("a", {href : "https://github.com/tivac/modular-css" }, "modular-css"),
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
                    m("button", {
                        class   : css.add,
                        onclick : createFile
                    }, "Add file"),

                    files.map((file, idx) => m("div", { class : css.file },
                        m("div", { class : css.meta },
                            m("input", {
                                class    : css.name,
                                value    : file,
                                onchange : (e) => (files[idx] = e.target.value)
                            }),

                            idx > 0 && m("button", {
                                class : css.remove,

                                onclick : () => {
                                    var out = files.splice(idx, 1);

                                    fs.unlink(out[0]);

                                    process();
                                }
                            }, "✖")
                        ),
                        
                        m("textarea", {
                                oncreate : (vnode) => {
                                    var editor = cm.fromTextArea(vnode.dom, {
                                            mode        : "text/css",
                                            theme       : "monokai",
                                            lineNumbers : true,
                                            autofocus   : true
                                        });

                                    editor.on("changes", () => {
                                        fs.writeFileSync(file, editor.doc.getValue());

                                        processor.remove([
                                            file
                                        ]);
                                        
                                        throttled();
                                    });
                                }
                            },
                            fs.readFileSync(file, "utf8")
                        )
                    ))
                ),

                m("div", { class : css.output },
                    m(tabs, {
                        active : tab,
                        tabs   : {
                            Errors : () => m("pre", { class : css.errors },
                                error || "No errors!"
                            ),

                            CSS : () => m("div", { class : css.panel },
                                m("textarea", {
                                    oncreate : (vnode) => {
                                        vnode.state.editor = cm.fromTextArea(vnode.dom, {
                                            mode        : "text/css",
                                            theme       : "monokai",
                                            lineNumbers : true,
                                            readOnly    : "nocursor",
                                            value       : output.css
                                        });
                                    },

                                    onupdate : (vnode) => vnode.state.editor.doc.setValue(output.css)
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
                                            value       : output.json
                                        });
                                    },

                                    onupdate : (vnode) => vnode.state.editor.doc.setValue(output.json)
                                })
                            ),
                            
                            Export : () => m("div", { class : css.panel },
                                m("textarea", {
                                    oncreate : (vnode) => {
                                        vnode.state.editor = cm.fromTextArea(vnode.dom, {
                                            mode        : "text/css",
                                            theme       : "monokai",
                                            lineNumbers : true,
                                            readOnly    : "nocursor",
                                            value       : exported()
                                        });
                                    },

                                    onupdate : (vnode) => vnode.state.editor.doc.setValue(exported())
                                })
                            )
                        }
                    })
                )
            )
        ]
    }
});
