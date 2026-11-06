<script>
import { page } from "$app/state";

import Header from "./_layout/header.svelte";
import css from "./_layout/layout.mcss";
</script>

<div class={css.page} data-fullscreen={page.data.fullscreen}>
    <Header />

    {#if page.data.toc}
        <nav class={css.toc}>
            {@html page.data.toc}
        </nav>
    {/if}

    <main class={css.content}><slot></slot></main>
</div>
