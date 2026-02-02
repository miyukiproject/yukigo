import grammar from "./grammar.js";
import nearley from "nearley";
import { AST, Expression, YukigoParser } from "yukigo-ast";

export class YukigoParserPlaceholder implements YukigoParser {
  public errors: string[] = [];
  constructor() {
    this.errors = [];
  }

  public parse(code: string): AST {
    return this.feedParser(code);
  }
  public parseExpression(code: string): Expression {
    return this.feedParser(code);
  }
  private feedParser(code: string) {
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    try {
      parser.feed(code);
      parser.finish();
    } catch (error) {
      console.log(error);
      if ("token" in error) {
        const token = error.token;
        const message = `Parser: Unexpected '${token.type}' token '${token.value}' at line ${token.line} col ${token.col}.`;
        this.errors.push(message);
        throw Error(message);
      }
      throw error;
    }
    if (parser.results.length > 1) {
      const msg = `Parser: Too much ambiguity. ${parser.results.length} ASTs parsed. Output not generated.`;
      this.errors.push(msg);
      throw Error(msg);
    }
    if (parser.results.length == 0) {
      this.errors.push("Parser did not generate an AST.");
      throw Error("Parser did not generate an AST.");
    }
    const ast = parser.results[0];
    return ast;
  }
}
