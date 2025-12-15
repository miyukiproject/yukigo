import { AST, Expression, YukigoParser } from "yukigo-ast";
import nearley from "nearley";
import grammar from "./grammar.js";
import { Token } from "moo";
import { stdCode } from "../std.js";

class UnexpectedToken extends Error {
  constructor(token: Token) {
    super(
      `Parser: Unexpected '${token.type}' token '${token.value}' at line ${token.line} col ${token.col}.`
    );
  }
}
class AmbiguityError extends Error {
  constructor(amountAST: number) {
    super(
      `Parser: Too much ambiguity. ${amountAST} ASTs parsed. Output not generated.`
    );
  }
}

export type HaskellConfig = {
  typecheck: boolean;
};

export class YukigoPrologParser implements YukigoParser {
  public errors: string[] = [];
  private std: AST;
  constructor(
    std: string = stdCode,
  ) {
    this.errors = [];
    this.std = this.feedParser(std);
  }
  public parse(code: string): AST {
    const result = this.feedParser(code);
    const ast = this.std.concat(result);
    return ast;
  }
  public parseExpression(code: string): Expression {
    const expr = this.feedParser(code);
    return expr;
  }
  private feedParser(code: string): any {
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    try {
      parser.feed(code);
      parser.finish();
    } catch (error) {
      if ("token" in error) throw new UnexpectedToken(error.token);
      throw error;
    }
    const { results } = parser;
    if (results.length > 1) throw new AmbiguityError(results.length);
    if (results.length == 0) return [];
    return results[0];
  }
}
