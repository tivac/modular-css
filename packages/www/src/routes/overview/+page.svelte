<script context="module">
    throw new Error("@migration task: Check code was safely removed (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292722)");

import { content, toc } from "./_content/intro.md";

export function load() {
    // return {
    //     stuff : {
    //         toc,
    //     },
    // };
}
</script>

<script>
import Title from "$lib/title.svelte";

import css from "../_layout/layout.mcss";
</script>

<Title title="Overview" />

<div class={css.prose}>
    {@html content}
</div>

