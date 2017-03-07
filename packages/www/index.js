"use strict";
/* eslint-env browser, node */
/* eslint indent: off */

var m = require("mithril"),
    Processor = require("modular-css-core"),
    pkg = require("modular-css-core/package.json"),
    cm = require("codemirror"),
    throttle = require("throttleit"),

    css = require("./style.css"),

    files = [
        { name : "1.css", css : "" }
    ],
    output = {
        css : "",
        js  : false
    },
    error,
    throttled,
    tab = "css",
    state;

// Load up codemirror modes
require("codemirror/mode/css/css.js");
require("codemirror/mode/javascript/javascript.js");

// Hacks to get file resolution to work
require("module")._nodeModulePaths = () => [ "/" ];
require("module")._resolveFilename = (id) => id.slice(1);

function process() {
    var processor = new Processor();
    
    state = btoa(JSON.stringify(files));

    m.route.set(`/?${m.buildQueryString({ state : state })}`);
    
    Promise.all(files.map((file) => processor.string(file.name, file.css)))
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

function update(encoded) {
    try {
        files = JSON.parse(atob(encoded));

        process();
    } catch(e) {
        error = "Unable to parse state";
    }
}

function exported() {
    return "// Input Files\n\n" +
    files
        .map((file) => `// ${file.name}\n${file.css}`)
        .concat(
            output.css && `// Output CSS\n${output.css || ""}`,
            output.json && `// Output JSON\n${output.json || ""}`,
            error && `// Error\n${error}`
        )
        .filter(Boolean)
        .join("\n\n");
}

throttled = throttle(process, 200);

m.route(document.body, "/", {
    "/" : {
        oninit : (vnode) => {
            if(!vnode.attrs.state) {
                return;
            }

            update(vnode.attrs.state);
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
                        class : css.add,

                        onclick : () => files.push({
                            name : `${files.length + 1}.css`,
                            css  : ""
                        })
                    }, "Add file"),

                    files.map((file, idx) => m("div", { class : css.file },
                        m("div", { class : css.meta },
                            m("input", {
                                class    : css.name,
                                value    : file.name,
                                onchange : (e) => (file.name = e.target.value)
                            }),

                            idx > 0 && m("button", {
                                class : css.remove,

                                onclick : () => {
                                    files.splice(idx, 1);

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
                                        file.css = editor.doc.getValue();
                                        
                                        throttled();
                                    });
                                }
                            },
                            file.css
                        )
                    ))
                ),

                m("div", { class : css.output },
                    m("div", { class : css.tabs },
                        m("button", {
                            class : tab === "errors" ? css.active : css.tab,
                            onclick : () => (tab = "errors")
                        }, "Errors"),
                        
                        m("button", {
                            class : tab === "css" ? css.active : css.tab,
                            onclick : () => (tab = "css")
                        }, "CSS"),
                        
                        m("button", {
                            class : tab === "json" ? css.active : css.tab,
                            onclick : () => (tab = "json")
                        }, "JSON"),

                         m("button", {
                            class : tab === "export" ? css.active : css.tab,
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
