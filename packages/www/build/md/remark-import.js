import path from "path";

import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit, SKIP, CONTINUE } from "unist-util-visit";
import { readSync } from "to-vfile";

const remarkImport = (options = false) => {
    // TODO: this may need to be configurable some day
    const parser = unified().use(remarkParse);

    const { imported } = options;

    const plugin = (tree, file) => {
        // Need history length to resolve files, if it doesn't exist we bail
        if(!file.history.length) {
            return tree;
        }

        const parse = /^@import (?:"|'|“)?(?<name>[^'"”]*)(?:"|'|”)?(?:\n|$)/;
        const { dir } = path.parse(file.history[file.history.length - 1]);

        visit(tree, { type : "text" }, (node, index, parent) => {
            if(!node.value.startsWith("@import")) {
                return SKIP;
            }

            const matched = node.value.match(parse);

            if(!matched) {
                return SKIP;
            }

            const { name } = matched.groups;

            const target = path.resolve(dir, name);

            if(imported) {
                imported(target);
            }

            const md = readSync(target);

            const ast = parser.parse(md);
            const root = parser.runSync(ast);

            for(const i in root) {
                parent[i] = root[i];
            }

            return CONTINUE;
        });

        return tree;
    };

    parser.use(() => plugin);

    return plugin;
};

export default remarkImport;
