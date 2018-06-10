start
    = import_namespace
    / create_namespace
    / parameterized
    / assignment
    / composition
    / namespaced
    / simple

// Helpers
_ "whitespace"
    = [ \t\n\r]*

s "string"
    = "\"" chars:[^\"\r\n]* "\"" { return chars.join(""); }
    / "\'" chars:[^\'\r\n]* "\'" { return chars.join(""); }
  
// Partials

// wooga
identifier
    = chars:[a-z0-9-_]i+ { return chars.join(""); }

// wooga
// global(wooga)
reference
    = "global(" _ ref:identifier _ ")" { return { name : ref, global : true }; }
    / ref:identifier { return { name : ref }; }
 
// wooga
// wooga, tooga
references
    = _ head:reference tail:(_ "," _ ref:reference { return ref; })* _ {
            return [ head ].concat(tail);
        }

// "./wooga.css"
source "quoted source reference"
    = s

// from "./wooga"
from_source
    = _ "from" _ source:source {
        return source;
    }

// (capture everything to the end of the input)
trailing
    = value:.+ {
        return value.join("").trim();
    }

// Patterns

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
    = _ "*" _ "as" _ name:identifier source:from_source {
        return {
            type : "namespace",
            source,
            name,
        };
    }

// fooga: booga
assignment "@value assignment"
    = ref:reference _ ":" _ value:trailing {
        return {
            type : "assignment",
            name : ref.name,
            value,
        };
    }

// fooga(a, b): booga $a
parameterized
    = name:identifier "("
    	_ args:(
    		head:identifier
        	tail:(_ "," _ arg:identifier { return arg; })*
        	{ return [ head ].concat(tail); }
      	) _
      ")" _ ":" _ value:trailing {
        return {
            type : "parameterized",
            args : args,
            name,
            value,
        }
    }


// @value or composes:

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

// composes: only

// fooga.booga
namespaced
    = ns:identifier "." ref:identifier {
        return {
            type : "namespaced",
            ns,
            ref,
        };
    }

// fooga
// fooga, wooga
simple
    = refs:references {
        return {
            type : "simple",
            refs,
        };
    }
