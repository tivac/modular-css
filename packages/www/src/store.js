import fs from "fs";
import path from "path";

// TODO: remove debugging
window.fs = fs;

import { Store } from "svelte/store";
import Processor from "@modular-css/processor";
import lz from "lznext";

import listen from "./listen.js";

const processor = new Processor({
    cwd : "/",

    // Custom file resolver to work around gaps in fake node environment
    resolvers : [
        (src, file) => path.resolve(`/${file}`),
    ],
});

// iterators are so much fun
const first = (set) => set.values().next().value;

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
        this.set({
            files,
            file : first(files),
        });

        return files;
    }

    async output() {
        try {
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

    async update(name, contents) {
        fs.writeFileSync(name, contents, "utf8");

        this.hash();

        if(processor.has(name)) {
            processor.invalidate(name);
        }

        try {
            await processor.file(name);
            
            this.output();
        } catch(error) {
            console.warn(`Error parsing "${error.file}"`, error);

            this.set({ error });
        }
    }

    remove(name) {
        const { file, files } = this.get();

        files.delete(name);

        processor.remove(name);

        fs.unlinkSync(name);

        this.set({
            files,
            file : name === file ? first(files) : file,
        });
    }
    
    add() {
        const { files } = this.get();

        let idx = files.size + 1;
        let name;

        // TODO: fix keyword-spacing rule to include `do`
        do{
            idx++;
            name = `/file${idx}.css`;
        } while(files.has(name));

        files.add(name);

        fs.writeFileSync(name, "", "utf8");

        processor.file(name);

        // Trigger downstream updates
        this.set({
            files,
            file : name,
        });
    }

    hash() {
        const { files } = this.get();

        // Update location.hash with fs state
        const hash = [ ...files.values() ].map((value) => ([
            value,
            fs.readFileSync(value, "utf8")
        ]));

        location.hash = lz.compressToBase64(JSON.stringify(hash));
    }
}

const store = new CssStore({
    files : new Set(),
    file  : false,

    error : false,
    
    css          : "",
    compositions : {},
});

listen(store, "files", () => {
    store.hash();
    store.output();
});

export default store;
