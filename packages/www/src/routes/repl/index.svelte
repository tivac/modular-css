<script context="module">
export function load() {
    return {
        stuff : {
            fullscreen : true,
        },
    };
}
</script>

<script>
import { onMount } from "svelte";

import Title from "$lib/title.svelte";

import Editor from "./_editor/editor.svelte";

import hash from "./_lib/hash.js";
import { error } from "./_lib/stores.js";

import Tabs from "./_tabs.svelte";
import Output from "./_output.svelte";

import css from "./_repl.mcss";

onMount(hash);
</script>

<Title title="REPL" />

<div class={css.repl}>
    <Tabs />

    <div class={css.input}>
        <Editor />
    </div>

    <Output />
    
    <div class={css.error} data-visible={Boolean($error)}>
        <pre>{$error && $error.toString()}</pre>
    </div>
</div>

