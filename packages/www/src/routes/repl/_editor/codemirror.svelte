<script>
import { onMount, onDestroy, createEventDispatcher } from "svelte";
import debounce from "debounce";

import css from "./codemirror.mcss";

const loading = import("./codemirror.js");

const dispatch = createEventDispatcher();

let slow = false;

// If codemirror takes > 100ms to load, warn about it
const ticking = setTimeout(() => (slow = true), 100);

let editor;
let textarea;
let clearError;

export async function input(src = "") {
    await loading;

    if (editor.getValue() === src) {
        return;
    }

    editor.setValue(src);
}

export async function error(err) {
    await loading;

    if (clearError) {
        clearError();
        clearError = null;
    }

    const { line, column, source } = err;

    // Only try and highlight lines if the necessary info exists
    if (typeof line === "undefined" || typeof column === "undefined") {
        throw err;
    }

    // Mark the offending line
    editor.addLineClass(line - 1, "wrap", css.errorLine);

    // And underline the offending text as best we can
    const marker = editor.markText(
        { line: line - 1, ch: column - 1 },
        { line: line - 1, ch: column - 1 + source.trimEnd().length },
        { className: css.errorLocation },
    );

    // Save a function to clear all the error markers
    clearError = () => {
        editor.removeLineClass(line - 1, "wrap", css.errorLine);

        marker.clear();
    };
}

onMount(async () => {
    // Instantiate codemirror once it's loaded
    const { codemirror } = await loading;

    clearTimeout(ticking);

    editor = codemirror.fromTextArea(textarea, {
        lineNumbers: true,
        lineWrapping: true,
        indentUnit: 4,
        mode: "text/modular-css",
        theme: "nord",
    });

    editor.on(
        "change",
        debounce(() => {
            if (clearError) {
                clearError();
                clearError = null;
            }

            dispatch("change", {
                content: editor.getValue(),
            });
        }, 250),
    );
});

onDestroy(() => {
    if (ticking) {
        clearTimeout(ticking);
    }

    editor.toTextArea();
    editor = null;
});
</script>

{#await loading}
    {#if slow}
        <div class={css.loading}>Loading editor...</div>
    {/if}
{:then}
    <div class={css.editor}>
        <textarea bind:this={textarea}></textarea>
    </div>
{:catch}
    <div class={css.loaderror}>Unable to load editor</div>
{/await}
