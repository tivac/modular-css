<link href="./home.css" />

<Page {styles}>
<div class="{css.home}">
    <div class="{css.title}">
        <h1 class="{css.head}">modular-css</h1>
        <h2 class="{css.headline}">CSS Modules, better and easier than ever.</h2>
    </div>

    <div class="{css.intro}">
        <div class="{css.introtext}">
            {@html intro}
        </div>

        <div class="{css.learn}">
            <a href="/guide/" class="{css.cta}">
                Learn More Now!
            </a>
        </div>
    </div>

    <div class="{css.example}">
        {@html example}
    </div>
</div>
</Page>

<script>
import Page from "../page.svelte";

import { content as intro } from "./intro.md";
import { content as example } from "./example.md";

export let styles;
</script>
