import m from "mithril";

import state from "../state.js";

import css from "./tabs.css";

export default {
    oninit(vnode) {
        vnode.state.active = vnode.attrs.active;
    },

    onupdate(vnode) {
        vnode.state.active = vnode.attrs.active;
    },

    view(vnode) {
        var tabs   = vnode.attrs.tabs,
            keys   = Object.keys(tabs);

        return m("div", { class : css.tabs },
            keys.map((key) => m("button", {
                    class   : key === state.tab ? css.active : css.tab,
                    onclick : () => (state.tab = key)
                },
                key
            )),

            tabs[state.tab]()
        );
    }
};
