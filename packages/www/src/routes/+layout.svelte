<script>
import { page } from "$app/stores";

import Header from "./_layout/header.svelte";
import css from "./_layout/layout.mcss";

$: ({ toc, fullscreen } = $page.data);
</script>

<div class={css.page} data-fullscreen={fullscreen}>
    <Header />

    {#if toc}
        <nav class={css.toc}>
            {@html toc}
        </nav>
    {/if}

    <main class={css.content}>
        <slot />
    </main>
</div>
