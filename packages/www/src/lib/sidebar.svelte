<link href="./sidebar.css" />

{#if tocs}
<div class="{css.sidebar}">
    {@html tocs}
</div>
{/if}

<script>
export let tocs;
</script>
