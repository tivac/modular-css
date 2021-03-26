<link href="./output.css" />

<div class="{css.output}">
    <CodeMirror {config} bind:this={codemirror} />
</div>

<script>
import { onMount } from "svelte";

import { output } from "./stores.js";

import CodeMirror from "./editor/codemirror.svelte";

const header = "/* CSS OUTPUT */";

const config = {
    readOnly : true,
};

let codemirror;

$: if(codemirror && $output) {
    codemirror.input([
        header,
        $output.css,
        "",
        "/* CLASS COMPOSITIONS */",
        "/**",
        JSON.stringify($output.compositions, null, 4),
        "**/",
    ].join("\n"));
}

onMount(() => {
    // Default to just the header
    codemirror.input(header);
});
</script>
