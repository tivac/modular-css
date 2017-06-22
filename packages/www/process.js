import fs from "fs";

import m from "mithril";
import throttle from "throttleit";

import state from "./state.js";

export function process() {
    var hash = btoa(
            JSON.stringify(
                state.files.map((name) => ({
                    name,
                    css : fs.readFileSync(name, "utf8")
                }))
            )
        );
    
    location.hash = `#${hash}`;
    
    Promise.all(
        state.files.map((file) =>
            state.processor.file(file)
        )
    )
    .then(() => state.processor.output())
    .then((result) => {
        state.output.css  = result.css;
        state.output.json = JSON.stringify(result.compositions, null, 4);

        state.error = false;
        
        if(state.tab === "Errors") {
            state.tab = "CSS";
        }
    })
    .catch((e) => {
        state.error = `${e.toString()}\n\n${e.stack}`;
    })
    .then(m.redraw);
}

export let throttled = throttle(process, 200);
