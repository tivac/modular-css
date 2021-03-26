<link rel="stylesheet" href="./repl.css" />

<div class="{css.repl}">
    <Tabs />

    <div class="{css.input}">
        <Editor />
    </div>

    <Output />
    
    <div class="{css.error}" data-visible={Boolean($error)}>
        <pre>{$error && $error.toString()}</pre>
    </div>
</div>

<script>
import { error } from "./stores.js";

import Editor from "./editor/editor.svelte";

import Tabs from "./tabs.svelte";
import Output from "./output.svelte";
</script>
