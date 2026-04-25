import { AST, Expression, YukigoParser } from "yukigo-ast";
import nearley from "nearley";
import * as grammar from "./grammar.js";
import { Token } from "moo";

interface NearleyError {
  token?: any;
  offset?: number;
  [key: string]: any;
}

class UnexpectedToken extends Error {
  constructor(token: Token) {
    super(
      `Parser: Unexpected '${token.type}' token '${token.value}' at line ${token.line} col ${token.col}.`,
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
    } catch (e: unknown) {
      const error = e as NearleyError; // Assert the shape
      if (error.token) {
        throw new UnexpectedToken(error.token);
      }
      throw error;
    }
    const results = parser.results;
    if (results.length > 1)
      throw Error(
        `Ambiguous grammar. The parser generated ${results.length} ASTs`,
      );
    return results[0];
  }
}
