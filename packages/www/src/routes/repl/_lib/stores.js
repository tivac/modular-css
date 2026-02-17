import { writable, derived } from "svelte/store";
import Processor from "@modular-css/processor";
import nested from "postcss-nested";

const map = new Map();

const files = writable(map);
const file = writable(false);
const error = writable(false);

const processor = new Processor({
    cwd : "/",

    verbose : true,

    // Custom file resolver to work around gaps in fake node environment
    resolvers : [
        (src, id) => id.replace(/^.\//, "/"),
    ],

    // Custom file loading because yo there's no fs
    loadFile(id) {
        return map.get(id);
    },

    before : [
        nested(),
    ],
});

const selected = derived([ file, files ], ([ $file, $files ]) => {
    if(!$files.size) {
        return false;
    }
    
    // Default to the first file
    if(!$files.has($file)) {
        const [ id ] = [ ...$files.keys() ];

        return {
            name : id,
            src  : $files.get(id),
        };
    }

    return {
        name : $file,
        src  : $files.get($file),
    };
}, {});

const output = derived([ files, error ], ([ , $error ], set) => {
    if($error) {
        return;
    }

    processor.output().then(set);
}, false);

const add = async (name, data = "") => {
    let idx = map.size;

    if(!name) {
        do {
            idx++;
            name = `/file${idx}.mcss`;
        } while(map.has(name));
    }

    map.set(name, data);

    try {
        await processor.file(name);
    } catch(e) {
        error.set(e);
    }

    // Trigger downstream updates
    files.set(map);
};

const remove = (name) => {
    map.delete(name);

    processor.remove(name);

    files.set(map);
};

const update = async (name, data = "") => {
    map.set(name, data);

    // TODO: this can get into a bad state on reload/back
    if(processor.has(name)) {
        processor.invalidate(name);
    }

    try {
        await processor.string(name, data);

        error.set(false);
    } catch(e) {
        // eslint-disable-next-line no-console -- error handling
        console.warn(`Error parsing "${e.file}"`, e);

        error.set(e);
    }

    files.set(map);
};

const initialize = async (data) => {
    // Clear any existing files from the processor
    map.forEach((contents, name) =>
        processor.remove(name)
    );

    map.clear();

    data.forEach(([ name, contents ]) => {
        map.set(name, contents);
    });

    await Promise.all(data.map(async ([ name ]) => {
        try {
            await processor.file(name);
        } catch(e) {
            error.set(e);
        }
    }));

    files.set(map);
};

const select = (name) => file.set(name);

const filesReadable = { subscribe : files.subscribe };
const errorReadable = { subscribe : error.subscribe };

globalThis.files = filesReadable;
globalThis.file = selected;

export {
    // Stores
    filesReadable as files,
    selected as file,
    errorReadable as error,
    output,
    select,

    // Methods
    add,
    remove,
    update,
    initialize,
};
