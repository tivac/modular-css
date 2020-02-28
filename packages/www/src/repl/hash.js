import lz from "lznext";

import { files, initialize } from "./stores.js";

let current;

const PROMPT = `
/* Here's some simple examples to get you started! */

/* Selector Scoping */
.fooga { color: red; }

/* Selector composition */
.booga {
    composes: fooga;
    
    background: blue;
}

/* Values */
@value fgColor: green;

.wooga {
    color: fgColor;
}
`.trim();

const initial = () => {
    const name = "/main.css";

    return [ name, PROMPT ];
};

const decode = (hash) => {
    hash = hash.replace(/^#/, "");
    
    let data;

    try {
        data = JSON.parse(
            lz.decompressFromEncodedURIComponent(hash)
        );

        if(!data) {
            data = [];

            data.push(initial());
        }
    } catch(e) {
        if(hash.length) {
            // eslint-disable-next-line no-console
            console.warn("Unable to parse hash:", e);
        }

        data = initial();
    }

    return data;
};

// Grab initial state from location.hash, or create it from nothing
const setup = async () => {
    const data = decode(location.hash);

    await initialize(data);
    
    // Update location.hash with hashed file data whenever it changes
    files.subscribe((names) => {
        const content = [ ...names.entries() ].map(([ file, contents ]) => ([
            file,
            contents,
        ]));

        const hashed = lz.compressToEncodedURIComponent(JSON.stringify(content));
    
        const next = `#${hashed}`;

        if(current === next) {
            return;
        }

        window.location = next;
        current = next;
    });

    // Listen for hash change events, compare against our current hash
    // and re-initialize everything if different
    window.addEventListener("hashchange", () => {
        if(location.hash === current) {
            return;
        }

        const decoded = decode(location.hash);

        initialize(decoded);
    });
};


export default setup;
