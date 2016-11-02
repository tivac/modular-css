// fooga from "./wooga"
// fooga, wooga from "./tooga"
// fooga
// fooga-wooga
// fooga_wooga
// global(fooga)
// fooga, wooga
// fooga, global(wooga)

start
    = composition
    / simple

// Helpers
_ "whitespace"
    = [ \t\n\r]*

s "string"
    = "\"" chars:[^\"\r\n]* "\"" { return chars.join(""); }
    / "\'" chars:[^\'\r\n]* "\'" { return chars.join(""); }
  
// Partials
ident "identifier"
    = chars:[a-z0-9-_]i+ { return chars.join(""); }

reference "reference"
    = "global(" _ ref:ident _ ")" { return { name : ref, global : true }; }
    / ref:ident { return { name : ref }; }
  
references "references"
    = _ refs:(ref:reference ("," _)? { return ref })+ _ { return refs; }

source
    = _ "from" _ source:s {
        return {
            source
        };
    }

// Patterns
composition
    = refs:references source:source {
        return Object.assign(source, { refs });
    }

simple
    = refs:references {
        return {
            refs,
            source : false
        };
    }
