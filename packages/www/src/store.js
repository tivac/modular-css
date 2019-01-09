import fs from "fs";
import path from "path";

// TODO: remove debugging
window.fs = fs;

import { Store } from "svelte/store";
import Processor from "@modular-css/processor";
import lz from "lznext";

const processor = new Processor({
    cwd : "/",

    // Custom file resolver to work around gaps in fake node environment
    resolvers : [
        (src, file) => path.resolve(`/${file}`),
    ],
});

class CssStore extends Store {
    constructor(...args) {
        super(...args);

        const files = this._initialFiles();

        // Load files into the processor
        files.forEach((file) => this.update(file, fs.readFileSync(file, "utf8")));
    }

    // Grab initial state from location.hash, or create it from nothing
    _initialFiles() {
        const { files } = this.get();

        if(location.hash) {
            const hash = location.hash.substring(1);

            try {
                const data = JSON.parse(lz.decompressFromBase64(hash));

                data.forEach(([ file, css ]) => {
                    files.add(file);

                    fs.writeFileSync(file, css, "utf8");
                });
            } catch(e) {
                console.warn("Unable to parse state", hash);
            }
        } else {
            const initial = "/main.css";

            files.add(initial);

            fs.writeFileSync(initial, "", "utf8");
        }

        // trigger downstream processing
        this.set({ files });

        return files;
    }

    async output() {
        try {
            const { files } = this.get();
            const { css, compositions } = await processor.output();

            return this.set({
                error : false,

                css,
                compositions,
            });
        } catch(error) {
            console.warn("Error generating output", error);

            return this.set({ error });
        }
    }

    async update(file, contents) {
        fs.writeFileSync(file, contents, "utf8");

        if(file in processor.files) {
            processor.invalidate(file);
        }

        try {
            await processor.file(file);
            
            this.output();
        } catch(error) {
            console.warn(`Error parsing "${error.file}"`, error);

            this.set({ error });
        }
    }

    remove(file) {
        const { files } = this.get();

        files.delete(file);

        processor.remove(file);

        fs.unlinkSync(file);

        this.output();

        // Trigger downstream updates
        this.set({ files });
    }
    
    add() {
        const { files } = this.get();

        let idx = files.size + 1;
        let file;

        // TODO: fix keyword-spacing rule to include `do`
        do{
            idx++;
            file = `/file${idx}.css`;
        } while(files.has(file));

        files.add(file);

        fs.writeFileSync(file, "", "utf8");

        // Trigger downstream updates
        this.set({ files });
    }
}

const store = new CssStore({
    files : new Set(),
    css   : "",
    error : false,

    compositions : [],
});

store.on("state", ({ changed, current }) => {
    if(!changed.files) {
        return;
    }

    const { files } = current;

    // Update location.hash with fs state
    const hash = [ ...files.values() ].map((value) => ([
        value,
        fs.readFileSync(value, "utf8")
    ]));

    location.hash = lz.compressToBase64(JSON.stringify(hash));

    // Calculate new output
    store.output();
});

export default store;
