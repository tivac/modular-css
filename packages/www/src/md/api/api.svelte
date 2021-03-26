<link href="./api.css" />

<Page title="Guide" {styles}>
    <div class="{css.guide}">
        <Sidebar {tocs} />

        <div class="{css.bd}">
            {@html content}
        </div>
    </div>
</Page>

<script>
import Page from "../page.svelte";
import Sidebar from "../sidebar.svelte";

import { content, tocs } from "./api.md";

export let styles;
</script>
