<script>
import Title from "$lib/title.svelte";
    
import { content } from "./_content/intro.md";
import css from "../_layout/layout.mcss";
</script>

<Title title="Overview" />

<div class={css.prose}>
    {@html content}
</div>

