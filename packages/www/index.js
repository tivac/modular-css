/* eslint-env browser, node */
/* eslint indent: off */
"use strict";

var m = require("mithril"),
    Processor = require("modular-css-core"),
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
    throttled;

// Load up codemirror modes
require("codemirror/mode/css/css.js");
require("codemirror/mode/javascript/javascript.js");

// Hacks to get file resolution to work
require("module")._nodeModulePaths = () => [ "/" ];
require("module")._resolveFilename = (id) => id.slice(1);

function process() {
    var processor = new Processor();
    
    Promise.all(files.map((file) => processor.string(file.name, file.css)))
    .then(() => processor.output())
    .then((result) => {
        output.css  = result.css;
        output.json = JSON.stringify(result.compositions, null, 4);

        m.route.set(`/?${m.buildQueryString({ state : btoa(JSON.stringify(files)) })}`);

        error = false;
    })
    .catch((e) => (error = e.toString()))
    .then(m.redraw);
}

throttled = throttle(process, 200);

m.route(document.body, "/", {
    "/" : {
        oninit : (vnode) => {
            if(!vnode.attrs.state) {
                return;
            }
            
            try {
                files = JSON.parse(atob(vnode.attrs.state));

                process();
            } catch(e) {
                error = "Unable to parse saved state";
            }
        },

        view : () => m("div", { class : css.content },
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
                error && [
                    m("h2", "Error"),
                    m("div", { class : css.error },
                        m("pre", error)
                    )
                ],
                
                m("h2", "CSS Output"),
                
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
                }, output.css),
                
                m("h2", "Compositions"),
                
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
            )
        )
    }
});
