import moo from "moo";

export const LexerConfig = {
  NL: { match: /\r?\n/, lineBreaks: true },
  WS: / |\t/,
  number:
    /0[xX][0-9a-fA-F]+|0[bB][01]+|0[oO][0-7]+|(?:\d*\.\d+|\d+)(?:[eE][+-]?\d+)?/,
  char: /'(?:\\['\\bfnrtv0]|\\u[0-9a-fA-F]{4}|[^'\\\n\r])?'/,
  string: /"(?:\\["\\bfnrtv0]|\\u[0-9a-fA-F]{4}|[^"\\\n\r])*"/,
  bool: {
    match: ["True", "False"],
  },
  op: /\+|-|\*|\//,
  variable: {
    match: /[a-z_][a-zA-Z0-9_']*/,
  },
};

export const Lexer = moo.compile(LexerConfig);
