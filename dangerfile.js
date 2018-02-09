"use strict";

const fs   = require("fs");
const path = require("path");

const locater  = require("locater");
const pinpoint = require("pinpoint");
const dedent   = require("dedent");
    
const jsfiles = danger.git.created_files
    .concat(danger.git.modified_files)
    .filter((file) => path.extname(file) === ".js");

function link(file, anchor) {
    var repo = danger.github.pr.head.repo.html_url,
        ref  = danger.github.pr.head.ref;
    
    return `<a href='${repo}/blob/${ref}/${file}${anchor || ""}'>${file}</a>`;
}

// Every non-specimen JS file should start with "use strict";
jsfiles
    .filter((file) => [
            "test/specimens",
            "test/results",
            // since it has the node header
            "cli.js",
            // generated
            "parser.js"
        ].every((filter) => file.indexOf(filter) === -1))
    .forEach((file) => {
        var loc = fs.readFileSync(file, "utf8").indexOf(`"use strict";`);

        if(loc === 0) {
            return;
        }

        fail(`${link(file, "#L1")} does not declare strict mode immediately`);
    });

// Be careful of leaving testing shortcuts in the codebase
jsfiles
    .filter((file) => file.indexOf("test") > -1)
    .forEach(file => {
        var code = fs.readFileSync(file, "utf8"),
            locs = locater.find(/it\.only|describe\.only/g, code);
        
        locs.forEach((loc) =>
            fail(dedent(`
                ${link(file, `#L${loc.line}`)} is preventing tests from running.
                <pre lang="javascript">
                ${pinpoint(code, { line: loc.line, column : loc.cursor })}
                </pre>
            `))
        )
    });

    