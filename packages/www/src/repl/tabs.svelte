<link href="./tabs.css" />

<div class="{css.tabs}">
    <button
        class="{css.add}"
        title="Add a new file"
        on:click={() => add()}
    >
        ➕
    </button>
    
    <div class="{css.tabs}">
        {#each [ ...$files.keys() ] as f (f)}
        <div class="{$file.name === f ? css.tabon : css.tab}">
            <button
                class="{css.file}"
                on:click={() => select(f)}
            >
                {f}
            </button>

            {#if $files.size > 1}
                <button
                    class="{css.remove}"
                    title="Remove {f}"
                    on:click={() => remove(f)}
                >
                    ❌
                </button>
            {/if}
        </div>
        {/each}
    </div>
</div>

<script>
import { files, file, remove, add, select } from "./stores.js";
</script>
