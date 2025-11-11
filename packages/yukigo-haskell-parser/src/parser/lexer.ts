import moo, { Lexer } from "moo";
import { keywords } from "../utils/types.js";
import { makeLexer } from "moo-ignore";
import IndentationLexer from "moo-indentation-lexer";

export const HaskellLexerConfig = {
  NL: { match: /\r?\n/, lineBreaks: true },
  anonymousVariable: "_",
  WS: / |\t/,
  comment: /--.*?$|{-[\s\S]*?-}/,
  number:
    /0[xX][0-9a-fA-F]+|0[bB][01]+|0[oO][0-7]+|(?:\d*\.\d+|\d+)(?:[eE][+-]?\d+)?/,
  char: /'(?:\\['\\bfnrtv0]|\\u[0-9a-fA-F]{4}|[^'\\\n\r])?'/,
  string: /"(?:\\["\\bfnrtv0]|\\u[0-9a-fA-F]{4}|[^"\\\n\r])*"/,
  //template: /`(?:\\[\s\S]|[^\\`])*`/,
  backtick: "`",
  lparen: "(",
  rparen: ")",
  lbracket: "{",
  rbracket: "}",
  lsquare: "[",
  rsquare: "]",
  rangeOperator: "..",
  semicolon: ";",
  typeArrow: "->",
  leftArrow: "<-",
  typeEquals: "::",
  question: "?",
  arrow: "=>",
  bool: {
    match: ["True", "False"],
  },
  op: /,|>>=|>>|\\\\|\\|\.|\+\+|\+|\-|\*\*|\*|===|!==|==|\/=|<=|>=|<|>|&&|\/|\|\||\.\.|\$|\^\^|\^|#|@|~|!!|!|%|\?|:|&|\||`/,
  assign: "=",
  constructor: {
    match: /[A-Z][a-zA-Z0-9']*/,
    type: moo.keywords({
      typeClass: [
        "Foldable",
        "Bounded",
        "Enum",
        "Eq",
        "Floating",
        "Fractional",
        "Functor",
        "Integral",
        "Ix",
        "Monad",
        "MonadPlus",
        "Num",
        "Ord",
        "Random",
        "RandomGen",
        "Read",
        "Real",
        "RealFloat",
        "RealFrac",
        "Show",
      ],
    }),
  },
  variable: {
    match: /[a-z_][a-zA-Z0-9_']*/,
    type: moo.keywords({
      otherwise: "otherwise",
      error: "error",
      keyword: keywords,
    }),
  },
};

export const HSLexer: Lexer = makeLexer(HaskellLexerConfig, []);
export const PreprocessorLexer: Lexer = new IndentationLexer({
  lexer: moo.compile(HaskellLexerConfig),
  indentationType: "WS",
  newlineType: 'NL',
});
