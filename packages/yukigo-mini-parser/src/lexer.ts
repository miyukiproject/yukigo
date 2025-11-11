import moo from "moo";
import { makeLexer } from "moo-ignore";

const keywords = [
  "return",
  "if",
  "else"
]

export const MiniLexerConfig = {
  EOF: "*__EOF__*",
  wildcard: "_",
  WS: /[ \t]+/,
  comment: /--.*?$|{-[\s\S]*?-}/,
  number:
    /0[xX][0-9a-fA-F]+|0[bB][01]+|0[oO][0-7]+|(?:\d*\.\d+|\d+)(?:[eE][+-]?\d+)?/,
  char: /'(?:\\['\\bfnrtv0]|\\u[0-9a-fA-F]{4}|[^'\\\n\r])?'/,
  string: /"(?:\\["\\bfnrtv0]|\\u[0-9a-fA-F]{4}|[^"\\\n\r])*"/,
  bool: {
    match: ["True", "False"],
  },
  semicolon: ";",
  assign: ":=",
  notEqual: "!=",
  equal: "==",
  gte: ">=",
  gt: ">",
  lte: "<=",
  lt: "<",
  lparen: "(",
  rparen: ")",
  lsquare: "[",
  rsquare: "]",
  lbracket: "{",
  rbracket: "}",
  comma: ",",
  operator: /\+|\*/,
  variable: {
    match: /[a-z_][a-zA-Z0-9_']*/,
    type: moo.keywords({
      keyword: keywords,
    }),
  },
  NL: { match: /\r?\n/, lineBreaks: true },
};

export const MiniLexer = makeLexer(MiniLexerConfig, ["NL", "comment"], {
  eof: true,
});
