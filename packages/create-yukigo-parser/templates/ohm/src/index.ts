import ohm from "ohm-js";
import {
  ArithmeticBinaryOperation,
  AST,
  Expression,
  NumberPrimitive,
  Return,
  SourceLocation,
  YukigoParser,
} from "yukigo-ast";
import fs from "node:fs";
import path from "node:path";

const grammarSource = fs.readFileSync(
  path.join(import.meta.dirname, "grammar.ohm"),
  "utf8"
);
const grammar = ohm.grammar(grammarSource);

export class YukigoParserPlaceholder implements YukigoParser {
  public errors: string[] = [];

  public parse(code: string): AST {
    return [new Return(this.parseExpression(code))];
  }

  public parseExpression(code: string): Expression {
    this.errors = [];
    const match = grammar.match(code, "Program");

    if (match.failed()) {
      const message = `Parser: ${match.message}`;
      this.errors.push(message);
      throw new Error(message);
    }

    return buildExpression(code);
  }
}

const buildExpression = (code: string): Expression => {
  const tokens = code.match(/\d+|[+\-*/]/g) ?? [];

  if (tokens.length === 0) {
    throw new Error("Parser did not generate an AST.");
  }

  let cursor = 0;
  let expression: Expression = new NumberPrimitive(
    Number(tokens[cursor]),
    new SourceLocation(1, code.indexOf(tokens[cursor]) + 1)
  );
  cursor += 1;

  while (cursor < tokens.length) {
    const operator = tokens[cursor];
    const number = tokens[cursor + 1];

    expression = new ArithmeticBinaryOperation(
      mapOperator(operator),
      expression,
      new NumberPrimitive(
        Number(number),
        new SourceLocation(1, code.indexOf(number, code.indexOf(operator)) + 1)
      )
    );

    cursor += 2;
  }

  return expression;
};

const mapOperator = (operator: string) => {
  switch (operator) {
    case "+":
      return "Plus";
    case "-":
      return "Minus";
    case "*":
      return "Multiply";
    default:
      return "Divide";
  }
};
