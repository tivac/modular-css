import m from "mithril";
import cm from "codemirror";

// Load up codemirror modes
import "codemirror/mode/css/css.js";
import "codemirror/mode/javascript/javascript.js";

import state from "../state.js";

import "./editor.css";

export default {
    view : (vnode) =>
        m("textarea", {
            oncreate : (textarea) => {
                textarea.state.editor = cm.fromTextArea(textarea.dom, {
                    mode        : vnode.attrs.mode,
                    theme       : "monokai",
                    lineNumbers : true,
                    readOnly    : "nocursor",
                    value       : state.output[vnode.attrs.field]
                });
            },

            onupdate : (textarea) =>
                textarea.state.editor.doc.setValue(
                    state.output[vnode.attrs.field]
                )
        })
};
