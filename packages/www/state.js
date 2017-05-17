import fs from "fs";

import Processor from "modular-css-core";

var state =  {
    files : [],

    output : {
        css : "",
        js  : false
    },

    processor : new Processor({
        resolvers : [
            (src, file) => {
                file = file.replace(/^\.\.\/|\.\//, "");

                return `/${file}`;
            }
        ]
    }),
    
    tab : "CSS",
    
    error : false
};

export function createFile() {
    var file = `/${state.files.length + 1}.css`;

    fs.writeFileSync(file, `\n`);
    
    state.files.push(file);
}

export default state;
