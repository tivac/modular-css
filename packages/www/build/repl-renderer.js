"use strict";

const lz = require("lznext");
const dedent = require("dedent");

const { isProduction } = require("./environment.js");

const hash = (data) => lz.compressToEncodedURIComponent(JSON.stringify(data));

const base = isProduction ?
    "https://m-css.com" :
    "http://localhost:3000";

module.exports = (tokens, idx) => {
    const token = tokens[idx];

    // Closing tags/info
    if(token.nesting !== 1) {
        return `</div>\n`;
    }

    // Find fenced code token
    let code;

    for(let i = idx; i < tokens.length; i++) {
        if(tokens[i].type !== "fence") {
            continue;
        }
        
        code = tokens[i].content;
            
        break;
    }

    // split into triplets, "", filename, code
    const parts = code.split(/\/\* =+ ([\w-]+\.css) =+ \*\/\r?\n/g);

    let files;

    if(parts.length > 1) {
        files = parts.reduce((acc, curr) => {
            // Handle ""
            if(!curr.length) {
                return acc;
            }

            // Handle filename
            if(curr.endsWith(".css")) {
                let file = curr;

                if(file[0] !== "/") {
                    file = `/${file}`;
                }

                acc.push([ file ]);

                return acc;
            }

            // Handle code
            acc[acc.length - 1].push(curr);

            return acc;
        }, []);

        // Because the file demonstrating the feature always comes last
        // it's worth reversing the list here before hashing it
        files.reverse();
    } else {
        files = [
            [
                "./style.css",
                code,
            ],
        ];
    }

    const href = `${base}/repl/#${hash(files)}`;

    // Opening tag
    return dedent`
        <div class="repl-code">
            <a class="repl-link" href="${href}">Edit in REPL</a>
    `;
};
