<script>
import Title from "$lib/title.svelte";
        
import { content } from "./_content/api.md";
import css from "../_layout/layout.mcss";
</script>

<Title title="API" />

<div class={css.prose}>
    {@html content}
</div>
