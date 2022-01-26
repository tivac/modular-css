<link href="../_layout/layout.mcss" />

<Title title="Overview" />

<div class="{css.prose}">
    {@html content}
</div>

<script context="module">
import { content, toc } from "./_content/intro.md";

export function load() {
    return {
        stuff : {
            toc,
        },
    };
}
</script>

<script>
import Title from "$lib/title.svelte";
</script>