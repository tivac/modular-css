// Generated by Peggy 2.0.1.
//
// https://peggyjs.org/

"use strict";

function peg$subclass(child, parent) {
  function C() { this.constructor = child; }
  C.prototype = parent.prototype;
  child.prototype = new C();
}

function peg$SyntaxError(message, expected, found, location) {
  var self = Error.call(this, message);
  // istanbul ignore next Check is a necessary evil to support older environments
  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(self, peg$SyntaxError.prototype);
  }
  self.expected = expected;
  self.found = found;
  self.location = location;
  self.name = "SyntaxError";
  return self;
}

peg$subclass(peg$SyntaxError, Error);

function peg$padEnd(str, targetLength, padString) {
  padString = padString || " ";
  if (str.length > targetLength) { return str; }
  targetLength -= str.length;
  padString += padString.repeat(targetLength);
  return str + padString.slice(0, targetLength);
}

peg$SyntaxError.prototype.format = function(sources) {
  var str = "Error: " + this.message;
  if (this.location) {
    var src = null;
    var k;
    for (k = 0; k < sources.length; k++) {
      if (sources[k].source === this.location.source) {
        src = sources[k].text.split(/\r\n|\n|\r/g);
        break;
      }
    }
    var s = this.location.start;
    var loc = this.location.source + ":" + s.line + ":" + s.column;
    if (src) {
      var e = this.location.end;
      var filler = peg$padEnd("", s.line.toString().length, ' ');
      var line = src[s.line - 1];
      var last = s.line === e.line ? e.column : line.length + 1;
      var hatLen = (last - s.column) || 1;
      str += "\n --> " + loc + "\n"
          + filler + " |\n"
          + s.line + " | " + line + "\n"
          + filler + " | " + peg$padEnd("", s.column - 1, ' ')
          + peg$padEnd("", hatLen, "^");
    } else {
      str += "\n at " + loc;
    }
  }
  return str;
};

peg$SyntaxError.buildMessage = function(expected, found) {
  var DESCRIBE_EXPECTATION_FNS = {
    literal: function(expectation) {
      return "\"" + literalEscape(expectation.text) + "\"";
    },

    class: function(expectation) {
      var escapedParts = expectation.parts.map(function(part) {
        return Array.isArray(part)
          ? classEscape(part[0]) + "-" + classEscape(part[1])
          : classEscape(part);
      });

      return "[" + (expectation.inverted ? "^" : "") + escapedParts.join("") + "]";
    },

    any: function() {
      return "any character";
    },

    end: function() {
      return "end of input";
    },

    other: function(expectation) {
      return expectation.description;
    }
  };

  function hex(ch) {
    return ch.charCodeAt(0).toString(16).toUpperCase();
  }

  function literalEscape(s) {
    return s
      .replace(/\\/g, "\\\\")
      .replace(/"/g,  "\\\"")
      .replace(/\0/g, "\\0")
      .replace(/\t/g, "\\t")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/[\x00-\x0F]/g,          function(ch) { return "\\x0" + hex(ch); })
      .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return "\\x"  + hex(ch); });
  }

  function classEscape(s) {
    return s
      .replace(/\\/g, "\\\\")
      .replace(/\]/g, "\\]")
      .replace(/\^/g, "\\^")
      .replace(/-/g,  "\\-")
      .replace(/\0/g, "\\0")
      .replace(/\t/g, "\\t")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/[\x00-\x0F]/g,          function(ch) { return "\\x0" + hex(ch); })
      .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return "\\x"  + hex(ch); });
  }

  function describeExpectation(expectation) {
    return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
  }

  function describeExpected(expected) {
    var descriptions = expected.map(describeExpectation);
    var i, j;

    descriptions.sort();

    if (descriptions.length > 0) {
      for (i = 1, j = 1; i < descriptions.length; i++) {
        if (descriptions[i - 1] !== descriptions[i]) {
          descriptions[j] = descriptions[i];
          j++;
        }
      }
      descriptions.length = j;
    }

    switch (descriptions.length) {
      case 1:
        return descriptions[0];

      case 2:
        return descriptions[0] + " or " + descriptions[1];

      default:
        return descriptions.slice(0, -1).join(", ")
          + ", or "
          + descriptions[descriptions.length - 1];
    }
  }

  function describeFound(found) {
    return found ? "\"" + literalEscape(found) + "\"" : "end of input";
  }

  return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
};

function peg$parse(input, options) {
  options = options !== undefined ? options : {};

  var peg$FAILED = {};
  var peg$source = options.grammarSource;

  var peg$startRuleFunctions = { start: peg$parsestart };
  var peg$startRuleFunction = peg$parsestart;

  var peg$c0 = "\"";
  var peg$c1 = "'";
  var peg$c2 = "\\";
  var peg$c3 = "\r\n";
  var peg$c4 = "global";
  var peg$c5 = "(";
  var peg$c6 = ")";
  var peg$c7 = ",";
  var peg$c8 = "from";
  var peg$c9 = "*";
  var peg$c10 = "as";
  var peg$c11 = ":";

  var peg$r0 = /^[ \t\n\r]/;
  var peg$r1 = /^[^"\r\n]/;
  var peg$r2 = /^[^'\r\n]/;
  var peg$r3 = /^[0-9a-f]/i;
  var peg$r4 = /^[\x80-\uFFFF]/;
  var peg$r5 = /^[ \t\r\n\f]/;
  var peg$r6 = /^[^\r\n\f0-9a-f]/i;
  var peg$r7 = /^[_a-z0-9\-]/i;

  var peg$e0 = peg$otherExpectation("whitespace");
  var peg$e1 = peg$classExpectation([" ", "\t", "\n", "\r"], false, false);
  var peg$e2 = peg$otherExpectation("string");
  var peg$e3 = peg$literalExpectation("\"", false);
  var peg$e4 = peg$classExpectation(["\"", "\r", "\n"], true, false);
  var peg$e5 = peg$literalExpectation("'", false);
  var peg$e6 = peg$classExpectation(["'", "\r", "\n"], true, false);
  var peg$e7 = peg$classExpectation([["0", "9"], ["a", "f"]], false, true);
  var peg$e8 = peg$classExpectation([["\x80", "\uFFFF"]], false, false);
  var peg$e9 = peg$literalExpectation("\\", false);
  var peg$e10 = peg$literalExpectation("\r\n", false);
  var peg$e11 = peg$classExpectation([" ", "\t", "\r", "\n", "\f"], false, false);
  var peg$e12 = peg$classExpectation(["\r", "\n", "\f", ["0", "9"], ["a", "f"]], true, true);
  var peg$e13 = peg$classExpectation(["_", ["a", "z"], ["0", "9"], "-"], false, true);
  var peg$e14 = peg$otherExpectation("identifier");
  var peg$e15 = peg$otherExpectation("global");
  var peg$e16 = peg$literalExpectation("global", false);
  var peg$e17 = peg$otherExpectation("reference");
  var peg$e18 = peg$literalExpectation("(", false);
  var peg$e19 = peg$literalExpectation(")", false);
  var peg$e20 = peg$otherExpectation("references");
  var peg$e21 = peg$literalExpectation(",", false);
  var peg$e22 = peg$otherExpectation("source");
  var peg$e23 = peg$literalExpectation("from", false);
  var peg$e24 = peg$literalExpectation("*", false);
  var peg$e25 = peg$literalExpectation("as", false);
  var peg$e26 = peg$literalExpectation(":", false);
  var peg$e27 = peg$anyExpectation();

  var peg$f0 = function(chars) { return chars.join(""); };
  var peg$f1 = function(chars) { return chars.join(""); };
  var peg$f2 = function(digits) {
      return String.fromCharCode(parseInt(digits, 16));
    };
  var peg$f3 = function(char) { return char; };
  var peg$f4 = function(chars) { return chars.join(""); };
  var peg$f5 = function(ref) { return { name : ref, global : true }; };
  var peg$f6 = function(ref) { return { name : ref }; };
  var peg$f7 = function(head, ref) { return ref; };
  var peg$f8 = function(head, tail) { return [ head ].concat(tail); };
  var peg$f9 = function(source) {
        return source;
    };
  var peg$f10 = function(source) {
        return {
            type : "import",
            source,
        };
    };
  var peg$f11 = function(name, source) {
        return {
            type : "namespace",
            source,
            name,
        };
    };
  var peg$f12 = function(name, alias, source) {
        return {
            type : "alias",
            alias,
            source,
            refs : [ { name } ],
        };
    };
  var peg$f13 = function(ref, value) {
        return {
            type  : "assignment",
            name  : ref.name,
            value : value.join(""),
        };
    };
  var peg$f14 = function(refs, source) {
        return {
            type : "composition",
            source,
            refs,
        };
    };
  var peg$currPos = 0;
  var peg$savedPos = 0;
  var peg$posDetailsCache = [{ line: 1, column: 1 }];
  var peg$maxFailPos = 0;
  var peg$maxFailExpected = [];
  var peg$silentFails = 0;

  var peg$result;

  if ("startRule" in options) {
    if (!(options.startRule in peg$startRuleFunctions)) {
      throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
    }

    peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
  }

  function text() {
    return input.substring(peg$savedPos, peg$currPos);
  }

  function offset() {
    return peg$savedPos;
  }

  function range() {
    return {
      source: peg$source,
      start: peg$savedPos,
      end: peg$currPos
    };
  }

  function location() {
    return peg$computeLocation(peg$savedPos, peg$currPos);
  }

  function expected(description, location) {
    location = location !== undefined
      ? location
      : peg$computeLocation(peg$savedPos, peg$currPos);

    throw peg$buildStructuredError(
      [peg$otherExpectation(description)],
      input.substring(peg$savedPos, peg$currPos),
      location
    );
  }

  function error(message, location) {
    location = location !== undefined
      ? location
      : peg$computeLocation(peg$savedPos, peg$currPos);

    throw peg$buildSimpleError(message, location);
  }

  function peg$literalExpectation(text, ignoreCase) {
    return { type: "literal", text: text, ignoreCase: ignoreCase };
  }

  function peg$classExpectation(parts, inverted, ignoreCase) {
    return { type: "class", parts: parts, inverted: inverted, ignoreCase: ignoreCase };
  }

  function peg$anyExpectation() {
    return { type: "any" };
  }

  function peg$endExpectation() {
    return { type: "end" };
  }

  function peg$otherExpectation(description) {
    return { type: "other", description: description };
  }

  function peg$computePosDetails(pos) {
    var details = peg$posDetailsCache[pos];
    var p;

    if (details) {
      return details;
    } else {
      p = pos - 1;
      while (!peg$posDetailsCache[p]) {
        p--;
      }

      details = peg$posDetailsCache[p];
      details = {
        line: details.line,
        column: details.column
      };

      while (p < pos) {
        if (input.charCodeAt(p) === 10) {
          details.line++;
          details.column = 1;
        } else {
          details.column++;
        }

        p++;
      }

      peg$posDetailsCache[pos] = details;

      return details;
    }
  }

  function peg$computeLocation(startPos, endPos) {
    var startPosDetails = peg$computePosDetails(startPos);
    var endPosDetails = peg$computePosDetails(endPos);

    return {
      source: peg$source,
      start: {
        offset: startPos,
        line: startPosDetails.line,
        column: startPosDetails.column
      },
      end: {
        offset: endPos,
        line: endPosDetails.line,
        column: endPosDetails.column
      }
    };
  }

  function peg$fail(expected) {
    if (peg$currPos < peg$maxFailPos) { return; }

    if (peg$currPos > peg$maxFailPos) {
      peg$maxFailPos = peg$currPos;
      peg$maxFailExpected = [];
    }

    peg$maxFailExpected.push(expected);
  }

  function peg$buildSimpleError(message, location) {
    return new peg$SyntaxError(message, null, null, location);
  }

  function peg$buildStructuredError(expected, found, location) {
    return new peg$SyntaxError(
      peg$SyntaxError.buildMessage(expected, found),
      expected,
      found,
      location
    );
  }

  function peg$parse_() {
    var s0, s1;

    peg$silentFails++;
    s0 = [];
    if (peg$r0.test(input.charAt(peg$currPos))) {
      s1 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e1); }
    }
    while (s1 !== peg$FAILED) {
      s0.push(s1);
      if (peg$r0.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e1); }
      }
    }
    peg$silentFails--;
    s1 = peg$FAILED;
    if (peg$silentFails === 0) { peg$fail(peg$e0); }

    return s0;
  }

  function peg$parses() {
    var s0, s1, s2, s3;

    peg$silentFails++;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 34) {
      s1 = peg$c0;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e3); }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      if (peg$r1.test(input.charAt(peg$currPos))) {
        s3 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e4); }
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        if (peg$r1.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e4); }
        }
      }
      if (input.charCodeAt(peg$currPos) === 34) {
        s3 = peg$c0;
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e3); }
      }
      if (s3 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f0(s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 39) {
        s1 = peg$c1;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e5); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        if (peg$r2.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e6); }
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          if (peg$r2.test(input.charAt(peg$currPos))) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$e6); }
          }
        }
        if (input.charCodeAt(peg$currPos) === 39) {
          s3 = peg$c1;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e5); }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f1(s2);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e2); }
    }

    return s0;
  }

  function peg$parsehex_digit() {
    var s0;

    if (peg$r3.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e7); }
    }

    return s0;
  }

  function peg$parsenonascii() {
    var s0;

    if (peg$r4.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e8); }
    }

    return s0;
  }

  function peg$parseunicode() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 92) {
      s1 = peg$c2;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e9); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      s3 = peg$currPos;
      s4 = peg$parsehex_digit();
      if (s4 !== peg$FAILED) {
        s5 = peg$parsehex_digit();
        if (s5 === peg$FAILED) {
          s5 = null;
        }
        s6 = peg$parsehex_digit();
        if (s6 === peg$FAILED) {
          s6 = null;
        }
        s7 = peg$parsehex_digit();
        if (s7 === peg$FAILED) {
          s7 = null;
        }
        s8 = peg$parsehex_digit();
        if (s8 === peg$FAILED) {
          s8 = null;
        }
        s9 = peg$parsehex_digit();
        if (s9 === peg$FAILED) {
          s9 = null;
        }
        s4 = [s4, s5, s6, s7, s8, s9];
        s3 = s4;
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      if (s3 !== peg$FAILED) {
        s2 = input.substring(s2, peg$currPos);
      } else {
        s2 = s3;
      }
      if (s2 !== peg$FAILED) {
        if (input.substr(peg$currPos, 2) === peg$c3) {
          s3 = peg$c3;
          peg$currPos += 2;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e10); }
        }
        if (s3 === peg$FAILED) {
          if (peg$r5.test(input.charAt(peg$currPos))) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$e11); }
          }
        }
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        peg$savedPos = s0;
        s0 = peg$f2(s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseescape() {
    var s0, s1, s2;

    s0 = peg$parseunicode();
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 92) {
        s1 = peg$c2;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e9); }
      }
      if (s1 !== peg$FAILED) {
        if (peg$r6.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e12); }
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f3(s2);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }

    return s0;
  }

  function peg$parsenmchar() {
    var s0;

    if (peg$r7.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e13); }
    }
    if (s0 === peg$FAILED) {
      s0 = peg$parsenonascii();
      if (s0 === peg$FAILED) {
        s0 = peg$parseescape();
      }
    }

    return s0;
  }

  function peg$parseident() {
    var s0, s1, s2;

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = [];
    s2 = peg$parsenmchar();
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parsenmchar();
      }
    } else {
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f4(s1);
    }
    s0 = s1;
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e14); }
    }

    return s0;
  }

  function peg$parseglobal_keyword() {
    var s0, s1;

    peg$silentFails++;
    if (input.substr(peg$currPos, 6) === peg$c4) {
      s0 = peg$c4;
      peg$currPos += 6;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e16); }
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e15); }
    }

    return s0;
  }

  function peg$parsereference() {
    var s0, s1, s2, s3, s4, s5, s6;

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = peg$parseglobal_keyword();
    if (s1 !== peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 40) {
        s2 = peg$c5;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e18); }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parse_();
        s4 = peg$parseident();
        if (s4 !== peg$FAILED) {
          s5 = peg$parse_();
          if (input.charCodeAt(peg$currPos) === 41) {
            s6 = peg$c6;
            peg$currPos++;
          } else {
            s6 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$e19); }
          }
          if (s6 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f5(s4);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parseident();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$f6(s1);
      }
      s0 = s1;
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e17); }
    }

    return s0;
  }

  function peg$parsereferences() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8;

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = peg$parse_();
    s2 = peg$parsereference();
    if (s2 !== peg$FAILED) {
      s3 = [];
      s4 = peg$currPos;
      s5 = peg$parse_();
      if (input.charCodeAt(peg$currPos) === 44) {
        s6 = peg$c7;
        peg$currPos++;
      } else {
        s6 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e21); }
      }
      if (s6 !== peg$FAILED) {
        s7 = peg$parse_();
        s8 = peg$parsereference();
        if (s8 !== peg$FAILED) {
          peg$savedPos = s4;
          s4 = peg$f7(s2, s8);
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
      } else {
        peg$currPos = s4;
        s4 = peg$FAILED;
      }
      while (s4 !== peg$FAILED) {
        s3.push(s4);
        s4 = peg$currPos;
        s5 = peg$parse_();
        if (input.charCodeAt(peg$currPos) === 44) {
          s6 = peg$c7;
          peg$currPos++;
        } else {
          s6 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e21); }
        }
        if (s6 !== peg$FAILED) {
          s7 = peg$parse_();
          s8 = peg$parsereference();
          if (s8 !== peg$FAILED) {
            peg$savedPos = s4;
            s4 = peg$f7(s2, s8);
          } else {
            peg$currPos = s4;
            s4 = peg$FAILED;
          }
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
      }
      s4 = peg$parse_();
      peg$savedPos = s0;
      s0 = peg$f8(s2, s3);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e20); }
    }

    return s0;
  }

  function peg$parsesource() {
    var s0, s1;

    peg$silentFails++;
    s0 = peg$parses();
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e22); }
    }

    return s0;
  }

  function peg$parsefrom_source() {
    var s0, s1, s2, s3, s4;

    s0 = peg$currPos;
    s1 = peg$parse_();
    if (input.substr(peg$currPos, 4) === peg$c8) {
      s2 = peg$c8;
      peg$currPos += 4;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e23); }
    }
    if (s2 !== peg$FAILED) {
      s3 = peg$parse_();
      s4 = peg$parsesource();
      if (s4 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f9(s4);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsestart() {
    var s0;

    s0 = peg$parseimport_namespace();
    if (s0 === peg$FAILED) {
      s0 = peg$parsecreate_namespace();
      if (s0 === peg$FAILED) {
        s0 = peg$parsecreate_alias();
        if (s0 === peg$FAILED) {
          s0 = peg$parseassignment();
          if (s0 === peg$FAILED) {
            s0 = peg$parsecomposition();
          }
        }
      }
    }

    return s0;
  }

  function peg$parseimport_namespace() {
    var s0, s1, s2, s3, s4;

    s0 = peg$currPos;
    s1 = peg$parse_();
    if (input.charCodeAt(peg$currPos) === 42) {
      s2 = peg$c9;
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e24); }
    }
    if (s2 !== peg$FAILED) {
      s3 = peg$parse_();
      s4 = peg$parsefrom_source();
      if (s4 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f10(s4);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecreate_namespace() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$parse_();
    if (input.charCodeAt(peg$currPos) === 42) {
      s2 = peg$c9;
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e24); }
    }
    if (s2 !== peg$FAILED) {
      s3 = peg$parse_();
      if (input.substr(peg$currPos, 2) === peg$c10) {
        s4 = peg$c10;
        peg$currPos += 2;
      } else {
        s4 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e25); }
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$parse_();
        s6 = peg$parseident();
        if (s6 !== peg$FAILED) {
          s7 = peg$parsefrom_source();
          if (s7 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f11(s6, s7);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecreate_alias() {
    var s0, s1, s2, s3, s4, s5, s6;

    s0 = peg$currPos;
    s1 = peg$parseident();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse_();
      if (input.substr(peg$currPos, 2) === peg$c10) {
        s3 = peg$c10;
        peg$currPos += 2;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e25); }
      }
      if (s3 !== peg$FAILED) {
        s4 = peg$parse_();
        s5 = peg$parseident();
        if (s5 !== peg$FAILED) {
          s6 = peg$parsefrom_source();
          if (s6 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f12(s1, s5, s6);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseassignment() {
    var s0, s1, s2, s3, s4, s5, s6;

    s0 = peg$currPos;
    s1 = peg$parsereference();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse_();
      if (input.charCodeAt(peg$currPos) === 58) {
        s3 = peg$c11;
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e26); }
      }
      if (s3 !== peg$FAILED) {
        s4 = peg$parse_();
        s5 = [];
        if (input.length > peg$currPos) {
          s6 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s6 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e27); }
        }
        if (s6 !== peg$FAILED) {
          while (s6 !== peg$FAILED) {
            s5.push(s6);
            if (input.length > peg$currPos) {
              s6 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$e27); }
            }
          }
        } else {
          s5 = peg$FAILED;
        }
        if (s5 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f13(s1, s5);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecomposition() {
    var s0, s1, s2;

    s0 = peg$currPos;
    s1 = peg$parsereferences();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsefrom_source();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f14(s1, s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  peg$result = peg$startRuleFunction();

  if (peg$result !== peg$FAILED && peg$currPos === input.length) {
    return peg$result;
  } else {
    if (peg$result !== peg$FAILED && peg$currPos < input.length) {
      peg$fail(peg$endExpectation());
    }

    throw peg$buildStructuredError(
      peg$maxFailExpected,
      peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
      peg$maxFailPos < input.length
        ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
        : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
    );
  }
}

module.exports = {
  SyntaxError: peg$SyntaxError,
  parse: peg$parse
};
