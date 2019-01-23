const path = require("path");

const dedent = require("dedent");
const shell = require("shelljs");

const { dest } = require("../environment.js");

const css = require("./css.js");

module.exports = () => {
    const Page = require(path.join(dest, "./page.cjs.js"));

    const scripts = shell
        .find(path.join(dest, "./repl*.js"))
        .map((script) => `shimport("../${path.relative(dest, script)}");`)
        .join("\n");

    return {
        file : path.join(dest, "./repl/index.html"),
        html : Page.render({
            title : "REPL",
            
            styles : css("repl"),
            
            scripts : dedent(`
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
        
                ${scripts}
                </script>
            `),
        })
    };
};
