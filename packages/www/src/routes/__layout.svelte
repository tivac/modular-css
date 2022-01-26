<link href="./_layout/layout.mcss" />

<div class="{css.page}" data-fullscreen="{fullscreen}">
    <Header />

    {#if toc}
    <nav class="{css.toc}">
        {@html toc}
    </nav>
    {/if}

    <main class="{css.content}">
        <slot />
    </main>
</div>

<script context="module">
import { page } from "$app/stores";
</script>

<script>
import Header from "./_layout/header.svelte";

$: ({ toc, fullscreen } = $page.stuff);
</script>