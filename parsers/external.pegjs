start
    = composition

// fooga from "./wooga"
// fooga, wooga from "./tooga"
composition
    = ref:reference source:from_source {
        return {
            type : "composition",
            source,
            ref
        };
    }
