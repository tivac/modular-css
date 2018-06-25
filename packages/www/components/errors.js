import m from "mithril";

import state from "../state.js";

import css from "./errors.css";

export default {
    view() {
        if(!state.error) {
            return null;
        }

        return m("div", { class : css.error }, state.error);
    },
};
