var m = require("mithril");
var Processor = require("modular-css-core");
var cm = require("codemirror");
var prism = require("prismjs");

var css = require("./style.css");

var files = [
    { name : "test.css", css : "" }
];
var output = "";


function process() {
    var processor = new Processor();
    
    Promise.all(files.map((file) => processor.string(file.name, file.css)))
    .then(() => processor.output())
    .then((result) => {
        output = result.css;

        m.redraw();
    })
    .catch(console.error.bind(console));
}

m.mount(document.body, {
    view : () => m("div",
        files.map((file) => m("div",
            m("input", { value : file.name }),
            m("textarea", {
                    oncreate : (vnode) => {
                        var editor = cm.fromTextArea(vnode.dom);

                        editor.on("changes", () => {
                            file.css = editor.doc.getValue();
                            
                            process();
                        });
                    }
                },
                file.css
            )
        )),

        m("button", {
            onclick : (e) => {
                files.push({
                    name : Date.now(),
                    contents : ""
                })
            }
        }, "Add file"),

        m("pre", m("code", { class : "language-css" }, output))
    )
})
