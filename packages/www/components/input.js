import fs from "fs";
import m from "mithril";
import cm from "codemirror";

import state from "../state.js";
import { process, throttled } from "../process.js";

import css from "./input.css";

export default {
    view(vnode) {
        var idx   = vnode.attrs.idx,
            file  = state.files[idx];

        return m("div", { class : css.file },
            m("div", { class : css.meta },
                m("p", "File:"),
                m("input", {
                    class    : css.name,
                    value    : file,
                    onchange : (e) => {
                        fs.writeFileSync(e.target.value, fs.readFileSync(file, "utf8"));
                        
                        state.files[idx] = e.target.value;
                    }
                }),

                idx > 0 && m("button", {
                    class : css.remove,

                    onclick : () => {
                        var out = state.files.splice(idx, 1);

                        fs.unlink(out[0]);

                        process();
                    }
                }, "✖")
            ),
            
            m("textarea", {
                    oncreate : (node) => {
                        var editor = cm.fromTextArea(node.dom, {
                                mode        : "text/css",
                                theme       : "monokai",
                                lineNumbers : true,
                                autofocus   : true
                            });

                        editor.on("changes", () => {
                            fs.writeFileSync(file, editor.doc.getValue());

                            state.processor.remove([
                                file
                            ]);
                            
                            throttled();
                        });
                    }
                },
                fs.readFileSync(file, "utf8")
            )
        );
    }
}
