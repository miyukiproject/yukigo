import {
  CstParser,
  Lexer,
  createToken,
  tokenMatcher,
  type IToken,
} from "chevrotain";

const WhiteSpace = createToken({
  name: "WhiteSpace",
  pattern: /\s+/,
  group: Lexer.SKIPPED,
});
const NumberLiteral = createToken({ name: "NumberLiteral", pattern: /\d+/ });
const Plus = createToken({ name: "Plus", pattern: /\+/ });
const Minus = createToken({ name: "Minus", pattern: /-/ });
const Multiply = createToken({ name: "Multiply", pattern: /\*/ });
const Divide = createToken({ name: "Divide", pattern: /\// });

export const allTokens = [
  WhiteSpace,
  Plus,
  Minus,
  Multiply,
  Divide,
  NumberLiteral,
];

export const parserLexer = new Lexer(allTokens);

export class TemplateParser extends CstParser {
  constructor() {
    super(allTokens);

    this.RULE("program", () => {
      this.SUBRULE(this.addition);
    });

    this.RULE("addition", () => {
      this.SUBRULE(this.multiplication, { LABEL: "lhs" });
      this.MANY(() => {
        this.OR([
          { ALT: () => this.CONSUME(Plus) },
          { ALT: () => this.CONSUME(Minus) },
        ]);
        this.SUBRULE2(this.multiplication, { LABEL: "rhs" });
      });
    });

    this.RULE("multiplication", () => {
      this.SUBRULE(this.primitive, { LABEL: "lhs" });
      this.MANY(() => {
        this.OR([
          { ALT: () => this.CONSUME(Multiply) },
          { ALT: () => this.CONSUME(Divide) },
        ]);
        this.SUBRULE2(this.primitive, { LABEL: "rhs" });
      });
    });

    this.RULE("primitive", () => {
      this.CONSUME(NumberLiteral);
    });

    this.performSelfAnalysis();
  }
}

export const isToken = (token: IToken, expected: typeof Plus) =>
  tokenMatcher(token, expected);
