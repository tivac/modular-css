const path = require("path");

const get = require("import-fresh");
const dedent = require("dedent");

const { dest } = require("../environment.js");

const css = require("./css.js");

module.exports = ({ graph, bundle, previous }) => {
    const entry = "page.cjs.js";
    const file = path.join(dest, "./repl/index.html");

    const Page = get(path.join(dest, entry));

    const [ js ] = Object.entries(previous())
        .find(([ , { isAsset, name }]) => !isAsset && name === "repl");

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

                shimport("../${js}");
        
                </script>
            `),
        })
    };
};
