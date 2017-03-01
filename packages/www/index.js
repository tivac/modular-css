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
        
        error = false;
    })
    .catch((e) => (error = e.toString()))
    .then(m.redraw);
}

throttled = throttle(process, 200);

m.mount(document.body, {
    view : () => m("div", { class : css.content },
        m("div", { class : css.files },
            m("button", {
                class : css.add,

                onclick : () => files.push({
                    name : `${files.length + 1}.css`,
                    css  : ""
                })
            }, "Add file"),

            files.map((file) => m("div", { class : css.file },
                m("input", {
                    class    : css.name,
                    value    : file.name,
                    onchange : (e) => (file.name = e.target.value)
                }),
                
                m("textarea", {
                        oncreate : (vnode) => {
                            var editor = cm.fromTextArea(vnode.dom);

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
            m("pre", m("code", { class : "language-css" }, output.css)),
            
            m("h2", "JSON Output"),
            m("pre", m("code", { class : "language-json" }, output.js))
        )
    )
});
