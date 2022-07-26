<script>
export let title = false;
</script>

<svelte:head>
    <title>modular-css{title ? ` | ${title}` : ""}</title>
</svelte:head>
