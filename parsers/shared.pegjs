// Helpers
_ "whitespace"
    = [ \t\n\r]*

s "string"
    = "\"" chars:[^\"\r\n]* "\"" { return chars.join(""); }
    / "\'" chars:[^\'\r\n]* "\'" { return chars.join(""); }


hex_digit
  = [0-9a-f]i

nonascii
  = [\x80-\uFFFF]

unicode
  = "\\" digits:$(hex_digit hex_digit? hex_digit? hex_digit? hex_digit? hex_digit?) ("\r\n" / [ \t\r\n\f])? {
      return String.fromCharCode(parseInt(digits, 16));
    }

escape
  = unicode
  / "\\" char:[^\r\n\f0-9a-f]i { return char; }

nmchar
  = [_a-z0-9-]i
  / nonascii
  / escape


// Partials

// wooga
ident "identifier"
    = chars:nmchar+ { return chars.join(""); }

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
