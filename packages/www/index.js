/* eslint indent: off */
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

// Hacks to get file resolution to work
require("module")._nodeModulePaths = () => [ "/" ];
require("module")._resolveFilename = (id) => id.slice(1);

function process() {
    var processor = new Processor();
    
    Promise.all(files.map((file) => processor.string(file.name, file.css)))
    .then(() => {
        return processor.output();
    })
    .then((result) => {
        output.css = result.css;
        output.js  = JSON.stringify(result.compositions, null, 4);
        
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
                                        mode        : "css",
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
                m("pre.line-numbers",
                    m("code", { class : "language-css" },
                        output.css || "/* Nothing yet... */"
                    )
                ),
                
                m("h2", "JSON Output"),
                m("pre.line-numbers",
                    m("code", { class : "language-js" },
                        output.js || "// Nothing yet..."
                    )
                )
            )
        )
    }
});
