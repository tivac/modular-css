// Helpers
_ "whitespace"
    = [ \t\n\r]*

s "string"
    = "\"" chars:[^\"\r\n]* "\"" { return chars.join(""); }
    / "\'" chars:[^\'\r\n]* "\'" { return chars.join(""); }

// Partials

// wooga
ident "identifier"
    = chars:[a-z0-9-_]i+ { return chars.join(""); }

global_keyword "global"
    = "global"

// wooga
// global(wooga)
reference "reference"
    = global_keyword "(" _ ref:ident _ ")" { return { name : ref, global : true }; }
    / ref:ident { return { name : ref }; }

// wooga
// wooga, tooga
references "references"
    = _ head:reference tail:(_ "," _ ref:reference { return ref; })* _ { return [ head ].concat(tail); }

// "./wooga.css"
source "source"
    = s

// from "./wooga"
from_source
    = _ "from" _ source:source {
        return source;
    }
