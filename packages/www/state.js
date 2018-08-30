import fs from "fs";

import Processor from "@modular-css/processor";

var state =  {
    files : [],

    output : {
        css : "",
        js  : false,
    },

    processor : new Processor({
        resolvers : [
            (src, file) => {
                file = file.replace(/^\.\.\/|\.\//, "");

                return `/${file}`;
            },
        ],
    }),
    
    tab : "CSS",
    
    error : false,
};

export function createFile() {
    var file = `/${state.files.length + 1}.css`;

    fs.writeFileSync(file, `\n`);
    
    state.files.push(file);
}

export function output() {
    return `## Files\n\n${
        state.files
            .map((file) => `/* ${file} */\n${fs.readFileSync(file, "utf8")}`)
            .concat(
                state.output.css && `## CSS Output\n\n${state.output.css}`,
                state.output.json && `## JSON Output\n\n${state.output.json}`,
                state.error && `## Error\n\n${state.error}`
            )
            .filter(Boolean)
            .join("\n\n")
    }`;
}

export default state;
