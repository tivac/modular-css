import fs from "fs";
import path from "path";

import { Store } from "svelte/store";
import Processor from "@modular-css/processor";
import lz from "lznext";

import listen from "./listen.js";
import { prompt } from "./data/prompt.js";

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

        this._parseHash();

        listen(this, "files", () => {
            this.hash();
            this.output();
        });
    }

    // Grab initial state from location.hash, or create it from nothing
    _parseHash() {
        const { files } = this.get();

        const hash = location.hash.substring(1);

        try {
            const data = JSON.parse(lz.decompressFromEncodedURIComponent(hash));

            data.forEach(([ file, css ]) => {
                files.add(file);

                fs.writeFileSync(file, css, "utf8");
            });

            // Add all the files to the processor once they've been written to disk
            files.forEach((file) => processor.file(file));

            // trigger downstream processing
            this.set({
                files,
                file : first(files),
            });
        } catch(e) {
            if(hash.length) {
                // eslint-disable-next-line no-console
                console.warn("Unable to parse hash:", e);
            }

            this.initial({ content : prompt });
        }
    }

    async initial({ content = "" } = false) {
        const { files } = this.get();

        const initial = "/main.css";

        files.add(initial);

        fs.writeFileSync(initial, content, "utf8");

        await processor.file(initial);

        this.set({
            files,
            file : first(files),
        });
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
            // eslint-disable-next-line no-console
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
            // eslint-disable-next-line no-console
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

        let idx = files.size;
        let name;

        do {
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

    async clear() {
        const { files } = this.get();

        files.forEach((file) => processor.remove(file));

        files.clear();

        // Force an update of the UI to clear everything out
        this.set({
            files,
            file : false,
        });
    }

    async reset(...args) {
        await this.clear();
        await this.initial(...args);
    }

    hash() {
        const { files } = this.get();

        // Update location.hash with fs state
        const hash = [ ...files.values() ].map((value) => ([
            value,
            fs.readFileSync(value, "utf8"),
        ]));

        location.hash = lz.compressToEncodedURIComponent(JSON.stringify(hash));
    }
}

const store = new CssStore({
    files : new Set(),
    file  : false,

    error : false,
    
    css          : "",
    compositions : {},
});

export default store;
