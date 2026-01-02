import { makeLexer } from "moo-ignore";
import moo from "moo";
export const PrologLexerConfig = {
  WS: /[ \t]+/,
  wildcard: "_",
  notOperator: { match: ["\\+", "not"] },
  forallRule: "forall",
  findallRule: "findall",
  comment: /%.*|\/\*[\s\S]*?\*\//,
  number:
    /\b(?:[0-9]+(?:\.[0-9]+(?:e[+-]?[0-9]+)?)?|0o[0-7]+|0x[0-9a-fA-F]+|0b[01]+)\b/,
  string: /(?:'(?:[^']|'')*'|"(?:[^"]|"")*")/,
  backtick: "`",
  lparen: "(",
  rparen: ")",
  lbracket: "{",
  rbracket: "}",
  lsquare: "[",
  rsquare: "]",
  comma: ",",
  arrow: "->",
  period: ".",
  semicolon: ";",
  colonDash: ":-",
  consOp: "|",
  queryOp: "?-",
  comparisonOp: /@<|@=<|@>=|@>|<|=<|>=|>|=@=|\\=@=|=:=|=\\=|==|\\==|\\=|=/,
  op: /\+|-|\*|\/|\/\/|~|\^|\?|\$|''|\.\./,
  variable: /[A-Z][a-zA-Z0-9_\u00C0-\u00FF]*/,
  atom: {
    match: /[a-z!][a-zA-Z0-9_\u00C0-\u00FF]*/,
    type: moo.keywords({
      primitiveOperator: ["round", "abs", "sqrt", "call"],
    }),
  },
  NL: { match: /\r?\n/, lineBreaks: true },
};

export const PrologLexer = makeLexer(PrologLexerConfig, ["comment", "NL"]);
