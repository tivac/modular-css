const path = require("path");

const dedent = require("dedent");

const { dest } = require("../environment.js");

const css = require("./css.js");

module.exports = ({ graph, bundle }) => {
    const entry = "page.cjs.js";
    const file = path.join(dest, "./repl/index.html");

    const Page = require(path.join(dest, entry));

    let repl;

    // TODO: need to find the REPL JS, but it isn't generated yet...
    // const repl = Object.entries(bundle).find(([ entry, { isAsset }]));

    return {
        file : path.join(dest, "./repl/index.html"),
        html : Page.render({
            title : "REPL",
            
            styles : css("repl.cjs.js", { file, graph, bundle }),
            
            script : dedent(`
                <script>
                function shimport(src) {
                    try {
                        new Function('import("' + src + '")')();
                    } catch (e) {
                        var s = document.createElement('script');
                        s.src = 'https://unpkg.com/shimport';
                        s.dataset.main = src;
                        document.head.appendChild(s);
                    }
                }
        
                </script>
            `),
        })
    };
};
