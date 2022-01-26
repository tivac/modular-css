<link href="./_home/home.mcss" />

<Title />

<div class="{css.home}">
    <div class="{css.title}">
        <h1 class="{css.head}">modular-css</h1>
        <h2 class="{css.headline}">CSS Modules, improved and extended.</h2>
    </div>

    <div class="{css.intro}">
        <div class="{css.introtext}">
            {@html intro}
        </div>

        <div class="{css.learn}">
            <a href="/overview/" class="{css.cta}">
                Learn More Now!
            </a>
        </div>
    </div>

    <div class="{css.example}">
        {@html example}
    </div>
</div>

<script context="module">
export function load() {
    return {
        stuff : {
            fullscreen : true,
        },
    };
}
</script>

<script>
import Title from "$lib/title.svelte";

import { content as intro } from "./_home/intro.md";
import { content as example } from "./_home/example.md";
</script>

