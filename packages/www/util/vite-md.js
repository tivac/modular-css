import { unified } from "unified";
import remarkParse from "remark-parse";
import { default as remarkRehype, defaultHandlers } from "remark-rehype";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeFormat from "rehype-format";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import rehypeTableOfContents from "rehype-toc";

import remarkImport from "./remark-import.js";
import rehypeCode from "./rehype-code.js";

const ESCAPES = new Map([
    [ "`", "\\`" ],
    [ "{", "\\{" ],
]);

const encodeStr = (str) =>
     str.replace(/`|\{/g, (match) => ESCAPES.get(match));


export default () => {
    const base = unified()
        .use(remarkParse)
        .use(remarkImport)
        .use(remarkRehype, {
            allowDangerousHtml : true,

            handlers : {
                ...defaultHandlers,

                // Syntax highlight code blocks w/ codemirror and our custom mcss syntax
                code : rehypeCode,
            },
        })
        .use(rehypeSlug)
        .freeze();
    
    const later = [
        [ rehypeAutolinkHeadings, {
            test    : [ "h2", "h3", "h4", "h5" ],
            content : {
                type  : "text",
                value : "#",
            },
            properties : {
                className : "anchor",
            },
        }],
        rehypeFormat,
        [ rehypeStringify, {
            allowDangerousHtml : true,
        }],
    ];

    return {
        async transform(src, id) {
            if(!id.endsWith(".md")) {
                return null;
            }

            let tocRaw;

            const processor = base()
                .use(rehypeTableOfContents, {
                    nav : false,
                    
                    headings : [ "h2", "h3" ],

                    customizeTOC : (node) => {
                        tocRaw = node;

                        return false;
                    },
                })
                .use(later);

            const processed = await processor.process({ path : id, value : src });

            const content = encodeStr(processed.toString("utf8"));
            const toc = encodeStr(processor.stringify(tocRaw));

            const code = `
                export const content = \`${content}\`;
                export const toc = \`${toc}\`;

                export default content;
            `;

            return {
                code,
                map  : { mappings : "" },
            };
        },
    };
};
