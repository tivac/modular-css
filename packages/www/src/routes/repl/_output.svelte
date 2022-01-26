<link href="./_output.mcss" />

<div class="{css.output}">
    <CodeMirror {config} bind:this={codemirror} />
</div>

<script>
import { onMount } from "svelte";

import { output } from "./_lib/stores.js";

import CodeMirror from "./_editor/codemirror.svelte";

const header = "/* == MODULAR-CSS OUTPUT == */";

const config = {
    readOnly : true,
};

let codemirror;

$: if(codemirror && $output) {
    codemirror.input([
        header,
        $output.css,
        "",
        "/* == CLASS COMPOSITIONS == */",
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
