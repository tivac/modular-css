import m from "mithril";
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
            active = vnode.state.active,
            keys   = Object.keys(tabs);

        return m("div", { class : css.tabs },
            keys.map((key) => m("button", {
                    class   : key === active ? css.active : css.tab,
                    onclick : () => (vnode.state.active = key)
                },
                key
            )),

            tabs[vnode.state.active]()
        );
    }
};
