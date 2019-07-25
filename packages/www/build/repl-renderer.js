"use strict";

const { utils } = require("markdown-it")();

const lz = require("lznext");
const dedent = require("dedent");

const { isProduction } = require("./environment.js");

const hash = (name, code) => {
    const data = [
        [
            `/${name}`,
            code,
        ],
    ];

    return lz.compressToEncodedURIComponent(JSON.stringify(data));
};

const base = isProduction ?
    "https://m-css.com" :
    "http://localhost:3000";

module.exports = (tokens, idx) => {
    const token = tokens[idx];

    // Closing tags/info
    if(token.nesting !== 1) {
        return `</div>\n`;
    }

    const [ , name ] = token.info.trim().split("repl ");

    // Find fenced code token
    let code;

    for(let i = idx; i < tokens.length; i++) {
        if(tokens[i].type !== "fence") {
            continue;
        }
        
        code = tokens[i].content;
            
        break;
    }

    code = code.split("/* OUTPUTS */")[0];

    const url = `${base}/repl/#${hash(name, code)}`;

    // Opening tag
    return dedent`
        <div class="repl-code">
            <a class="repl-link" href="${url}">Edit in REPL</a>
    `;
};
