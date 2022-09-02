<script>
import Title from "$lib/title.svelte";

import content from "../../../../../CHANGELOG.md";

import css from "./_changelog.mcss";
</script>

<Title title="Changelog" />

<div class={css.changelog}>
    {@html content}
</div>
