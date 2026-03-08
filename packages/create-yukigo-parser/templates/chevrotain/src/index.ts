import {
  ArithmeticBinaryOperation,
  AST,
  Expression,
  NumberPrimitive,
  Return,
  SourceLocation,
  YukigoParser,
} from "yukigo-ast";
import {
  Divide,
  Minus,
  Multiply,
  NumberLiteral,
  Plus,
  TemplateParser,
  allTokens,
  isToken,
  parserLexer,
} from "./parser.js";

export class YukigoParserPlaceholder implements YukigoParser {
  public errors: string[] = [];
  private readonly parser = new TemplateParser();

  public parse(code: string): AST {
    return [new Return(this.parseExpression(code))];
  }

  public parseExpression(code: string): Expression {
    this.errors = [];
    const lexingResult = parserLexer.tokenize(code);

    if (lexingResult.errors.length > 0) {
      const error = lexingResult.errors[0];
      const message = `Parser: Unexpected character at line ${error.line}, column ${error.column}.`;
      this.errors.push(message);
      throw new Error(message);
    }

    this.parser.input = lexingResult.tokens;
    const cst = this.parser.program();

    if (this.parser.errors.length > 0) {
      const error = this.parser.errors[0];
      this.errors.push(error.message);
      throw new Error(error.message);
    }

    return buildExpression(lexingResult.tokens);
  }
}

const buildExpression = (tokens: typeof parserLexer.tokenize extends (code: string) => infer R
  ? R extends { tokens: infer T }
    ? T
    : never
  : never): Expression => {
  const numberTokens = tokens.filter((token) => token.tokenType === NumberLiteral);
  const operatorTokens = tokens.filter((token) =>
    [Plus, Minus, Multiply, Divide].includes(token.tokenType as (typeof allTokens)[number])
  );

  if (numberTokens.length === 0) {
    throw new Error("Parser did not generate an AST.");
  }

  let expression: Expression = new NumberPrimitive(
    Number(numberTokens[0].image),
    new SourceLocation(numberTokens[0].startLine ?? 1, numberTokens[0].startColumn ?? 1)
  );

  for (let index = 0; index < operatorTokens.length; index += 1) {
    const operator = operatorTokens[index];
    const rhs = numberTokens[index + 1];

    expression = new ArithmeticBinaryOperation(
      mapOperator(operator),
      expression,
      new NumberPrimitive(
        Number(rhs.image),
        new SourceLocation(rhs.startLine ?? 1, rhs.startColumn ?? 1)
      )
    );
  }

  return expression;
};

const mapOperator = (token: (typeof parserLexer.tokenize("1").tokens)[number]) => {
  if (isToken(token, Plus)) return "Plus";
  if (isToken(token, Minus)) return "Minus";
  if (isToken(token, Multiply)) return "Multiply";
  return "Divide";
};
