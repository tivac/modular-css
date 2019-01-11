const fs = require("fs");
const path = require("path");

const shell = require("shelljs");
const MD = require("markdown-it");
const { default : toc } = require("markdown-it-toc-and-anchor");

const { dest } = require("./environment.js");

const md = new MD({
    html        : true,
    linkify     : true,
    typographer : true,
});

md.use(toc, {
    tocFirstLevel           : 3,
    wrapHeadingTextInAnchor : true,
});


[ "guide" ].forEach((section) => {
    const files = shell.find(path.resolve(__dirname, `../src/${section}/*.md`));
    
    const sources = files.map((file) => {
        let source = fs.readFileSync(file, "utf8");
    
        // Prefix headers to decrement them all down a level
        source = source.replace(/^#/gm, "##");
        
        return md.render(source);
    });

    const rendered = sources.join("\n");
    
    const dir = path.join(dest, `./${section}`);
    
    shell.mkdir("-p", dir);
    
    fs.writeFileSync(path.join(dir, "./index.html"), rendered, "utf8");
});
