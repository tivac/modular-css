start
    = composition
    / namespaced
    / simple

// fooga from "./wooga"
// fooga, wooga from "./tooga"
composition
    = refs:references source:from_source {
        return {
            type : "composition",
            source,
            refs
        };
    }

// fooga.booga
namespaced
    = ns:ident "." ref:ident {
        return {
            type : "namespaced",
            ns,
            ref
        };
    }

// fooga
// fooga, wooga
simple
    = refs:references {
        return {
            type : "simple",
            refs
        };
    }
