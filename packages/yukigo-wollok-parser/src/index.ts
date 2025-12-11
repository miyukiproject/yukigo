import { AST, Expression, YukigoParser } from "yukigo-ast";
import { parse } from "wollok-ts";
import { WollokToYukigoTransformer } from "./transformer.js";
import { Token } from "moo";

class UnexpectedToken extends Error {
  constructor(line, column, expectation) {
    super(
      `Parse error at line ${line} column ${column}: expected ${expectation}.`
    );
  }
}

export class YukigoWollokParser implements YukigoParser {
  public errors: string[] = [];
  constructor() {
    this.errors = [];
  }

  public parse(code: string): AST {
    const parserResult = parse.File("example").parse(code);
    if (parserResult.status === false) {
      const { index, expected } = parserResult;
      const expectation = expected.join(" or ");
      throw new UnexpectedToken(index.line, index.column, expectation);
    }
    const resultAST = parserResult.value;

    const transformer = new WollokToYukigoTransformer();
    const yukigoAst = transformer.transform(resultAST);

    return yukigoAst;
  }
  public parseExpression(code: string): Expression {
    const parserResult = parse.File("example").parse(code);
    if (parserResult.status === false) {
      const { index, expected } = parserResult;
      const expectation = expected.join(" or ");
      const message = `Parse error at line ${index.line} column ${index.column}: expected ${expectation}.`;
      throw new Error(message);
    }
    const resultAST = parserResult.value;

    const transformer = new WollokToYukigoTransformer();
    const yukigoAst = transformer.transformExpr(resultAST);

    return yukigoAst;
  }
}
