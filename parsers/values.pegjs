start
    = import_namespace
    / create_namespace
    / create_alias
    / assignment
    / composition

// @value only

// * from "./wooga"
import_namespace
    = _ "*" _ source:from_source {
        return {
            type : "import",
            source,
        };
    }

// * as fooga from "./wooga"
create_namespace
    = _ "*" _ "as" _ name:ident source:from_source {
        return {
            type : "namespace",
            source,
            name,
        };
    }

// fooga as wooga from "./booga"
// TODO: The faked-out "refs" here are a bit unfortunate...
create_alias
    = name:ident _ "as" _ alias:ident source:from_source {
        return {
            type : "alias",
            alias,
            source,
            refs : [ { name } ],
        };
    }

// fooga: booga
assignment
    = ref:reference _ ":" _ value:.+ {
        return {
            type  : "assignment",
            name  : ref.name,
            value : value.join(""),
        };
    }

// fooga from "./wooga"
// fooga, wooga from "./tooga"
composition
    = refs:references source:from_source {
        return {
            type : "composition",
            source,
            refs,
        };
    }
