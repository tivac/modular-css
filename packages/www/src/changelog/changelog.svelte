<link href="./changelog.css" />

<Page title="Changelog" {styles}>
    <div class="{css.changelog}">
        {@html content}
    </div>
</Page>

<script>
import Page from "../page.svelte";

import { content } from "../../../../CHANGELOG.md";

export let styles;
</script>
