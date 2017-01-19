"use strict";

var fs   = require("fs"),
    path = require("path"),
    
    jsfiles = danger.git.created_files
        .concat(danger.git.modified_files)
        .filter((file) => path.extname(file) === ".js");

function link(file, anchor) {
    var repo = danger.github.pr.head.repo.html_url,
        ref  = danger.github.pr.head.ref;
    
    return `<a href='${repo}/blob/${ref}/${file}${anchor || ""}'>${file}</a>`;
}

// Every JS file should start with "use strict";
jsfiles.forEach((file) => {
    var loc = fs.readFileSync(file).indexOf(`"use strict";`);

    if(loc === 0) {
        return;
    }

    fail(`${link(file, "#L1")} does not declare strict mode immediately`);
});
