/* eslint indent: off */
var m = require("mithril"),
    Processor = require("modular-css-core"),
    cm = require("codemirror"),
    throttle = require("throttleit"),

    css = require("./style.css"),

    files = [
        { name : "test.css", css : "" }
    ],
    output = "",
    error,
    throttled;

function process() {
    var processor = new Processor();
    
    Promise.all(files.map((file) => processor.string(file.name, file.css)))
    .then(() => processor.output())
    .then((result) => {
        output = result.css;
        error = false;
    })
    .catch((e) => (error = e.toString()))
    .then(m.redraw);
}

throttled = throttle(process, 200);

m.mount(document.body, {
    view : () => m("div", { class : css.content },
        m("div", { class : css.files },
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
            )),

            m("button", {
                onclick : () => files.push({
                    name : `file-${files.length}.css`,
                    css  : ""
                })
            }, "Add file")
        ),

        m("div", { class : css.output },
            error && m("div", { class : css.error },
                m("pre", error)
            ),
            m("pre", m("code", { class : "language-css" }, output))
        )
    )
});
