import GithubSlugger from "github-slugger";
import { hasProperty } from "hast-util-has-property";
import { heading } from "hast-util-heading";
import { headingRank } from "hast-util-heading-rank";
import { toString } from "hast-util-to-string";
import { visit } from "unist-util-visit";

const slugger = new GithubSlugger();

export default function rehypeHierarchicalSlug() {
    return (tree) => {
        const slugs = [];

        visit(tree, "element", (node) => {
            if(!heading(node) || !node.properties || hasProperty(node, "id")) {
                return;
            }

            const rank = headingRank(node);
            const slug = slugger.slug(toString(node));
            
            let last = slugs[slugs.length - 1];

            while(last && last.rank >= rank) {
                slugs.pop();

                last = slugs[slugs.length - 1];
            }
            
            if(rank > 1) {
                slugs.push({ rank, slug });
            }

            node.properties.id = slugs.map(({ slug : s }) => s).join("-");
        });
    };
}
