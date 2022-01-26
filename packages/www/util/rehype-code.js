import { u } from "unist-builder";
import { h as h2 } from "hastscript";
import lz from "lznext";

import codemirror from "codemirror/addon/runmode/runmode.node.js";

// Load up the various codemirror modes
import "codemirror/mode/css/css.js";
import "codemirror/mode/javascript/javascript.js";
import "codemirror/mode/shell/shell.js";
import "codemirror/mode/htmlmixed/htmlmixed.js";

// Load up m-css codemirror mode
import mcssMime from "../src/lib/codemirror-mcss-mime.js";

mcssMime(codemirror);

const hash = (data) => lz.compressToEncodedURIComponent(JSON.stringify(data));

// Mapping of markdown langs to codemirror langs
const MODE_MAP = new Map([
    [ "html", "htmlmixed" ],
    [ "css", "text/modular-css" ],
]);

// Syntax highlight code blocks w/ codemirror and our custom mcss syntax
// eslint-disable-next-line max-statements
export default (h, node) => {
    const value = node.value ? `${node.value}\n` : "";

    const { lang } = node;
    let type = lang;

    if(MODE_MAP.has(lang)) {
        type = MODE_MAP.get(lang);
    }

    const tags = [];

    codemirror.runMode(value, type, (token, style) => {
        if(style) {
            tags.push(h2("span", { class : `cm-${style}` }, [ token ]));
        } else {
            tags.push(u("text", token));
        }
    });

    const contents = h2("code", [
        h2("div", { class : "CodeMirror cm-s-nord CodeMirror-wraphtml" }, tags),
    ]);

    if(lang !== "css") {
        return h(node, "pre", { className : [ "code" ] }, [
            contents,
        ]);
    }

    // split into triplets, "", filename, code
    const [ , ...parts ] = value.split(/\/\* =+ ([\w-]+\.css) =+ \*\/\r?\n/g);

    const files = [];

    if(parts.length < 2) {
        files.push([
            "/style.css",
            value,
        ]);
    } else {
        for(let i = 0; i < parts.length; i += 2) {
            const file = parts[i];
            const code = parts[i + 1];

            files.push([
                file,
                code,
            ]);
        }

        // Because the file demonstrating the feature always comes last
        // it's worth reversing the list here before hashing it
        files.reverse();
    }

    const href = `/repl/#${hash(files)}`;

    return h(node, "div", { className : [ "repl-code" ] }, [
        h2("a", { href, className : [ "repl-link" ] }, [
            "Open in the REPL ▶️",
        ]),
        
        h2("pre", { className : [ "code" ] }, [
            contents,
        ]),
    ]);
};
