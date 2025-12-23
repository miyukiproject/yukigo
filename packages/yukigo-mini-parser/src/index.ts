import { AST, Expression, YukigoParser } from "yukigo-ast";
import nearley from "nearley";
import grammar from "./grammar.js";
import { Token } from "moo";

class UnexpectedToken extends Error {
  constructor(token: Token) {
    super(
      `Parser: Unexpected '${token.type}' token '${token.value}' at line ${token.line} col ${token.col}.`
    );
  }
}

export class YukigoMiniParser implements YukigoParser {
  public errors: string[] = [];

  public parse(code: string): AST {
    return this.feedParser(code);
  }
  public parseExpression(code: string): Expression {
    return this.feedParser(code);
  }
  private feedParser(code: string): any {
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    try {
      parser.feed(code);
      parser.finish();
    } catch (error) {
      if ("token" in error) throw new UnexpectedToken(error.token);
      throw error
    }
    const results = parser.results;
    if (results.length > 1)
      throw Error(
        `Ambiguous grammar. The parser generated ${results.length} ASTs`
      );
    return results[0];
  }
}
