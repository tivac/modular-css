"use strict";
import fs from "fs";
import Processor from "modular-css-core";
import m from "mithril";
import pkg from "modular-css-core/package.json";
import cm from "codemirror";
import throttle from "throttleit";

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
    
    error,
    throttled,
    tab = "css",
    state;

// Load up codemirror modes
require("codemirror/mode/css/css.js");
require("codemirror/mode/javascript/javascript.js");

window.fs = fs;

function createFile() {
    var file = `/${files.length + 1}.css`;

    fs.writeFileSync(file, `/* ${file} */\n`);
    
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
        
        if(tab === "errors") {
            tab = "css";
        }
    })
    .catch((e) => {
        error = e.toString();
        tab = "errors";
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

                console.log(parsed)

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
            m("h1", { class : css.head },
                m("a", { href : "https://github.com/tivac/modular-css" }, "modular-css"),
                " ",
                m("span", { class : css.subhead }, "v", pkg.version)
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
                    m("div", { class : css.tabs },
                        m("button", {
                            class   : tab === "errors" ? css.active : css.tab,
                            onclick : () => (tab = "errors")
                        }, "Errors"),
                        
                        m("button", {
                            class   : tab === "css" ? css.active : css.tab,
                            onclick : () => (tab = "css")
                        }, "CSS"),
                        
                        m("button", {
                            class   : tab === "json" ? css.active : css.tab,
                            onclick : () => (tab = "json")
                        }, "JSON"),

                         m("button", {
                            class   : tab === "export" ? css.active : css.tab,
                            onclick : () => (tab = "export")
                        }, "Export")
                    ),

                    tab === "errors" && m("pre", { class : css.errors },
                        error || "No errors!"
                    ),

                    tab === "css" && m("div", { class : css.panel },
                        m("textarea", {
                            oncreate : (vnode) => {
                                vnode.state.editor = cm.fromTextArea(vnode.dom, {
                                    mode        : "text/css",
                                    theme       : "monokai",
                                    lineNumbers : true,
                                    readOnly    : "nocursor"
                                });
                            },

                            onupdate : (vnode) => vnode.state.editor.doc.setValue(output.css)
                        }, output.css)
                    ),
                    
                    tab === "json" && m("div", { class : css.panel },
                        m("textarea", {
                            oncreate : (vnode) => {
                                vnode.state.editor = cm.fromTextArea(vnode.dom, {
                                    mode        : "application/json",
                                    theme       : "monokai",
                                    lineNumbers : true,
                                    readOnly    : "nocursor"
                                });
                            },

                            onupdate : (vnode) => vnode.state.editor.doc.setValue(output.json)
                        }, output.json)
                    ),

                    tab === "export" && m("div", { class : css.panel },
                        m("textarea", {
                            oncreate : (vnode) => {
                                vnode.state.editor = cm.fromTextArea(vnode.dom, {
                                    mode        : "text/css",
                                    theme       : "monokai",
                                    lineNumbers : true,
                                    readOnly    : "nocursor"
                                });
                            },

                            onupdate : (vnode) => vnode.state.editor.doc.setValue(exported())
                        }, exported())
                    )
                )
            )
        ]
    }
});
