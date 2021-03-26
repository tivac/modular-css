<CodeMirror
    bind:this={codemirror}
    on:change={({ detail }) => update($file.name, detail.content)}
/>

<script>
import { onMount } from "svelte";

import { file, update, error } from "../stores.js";

import CodeMirror from "./codemirror.svelte";

let codemirror;

// Update codemirror instance if the file value changed
$: if(codemirror) {
    codemirror.input($file.src);
}

$: if(codemirror && $error) {
    codemirror.error($error);
}
</script>
