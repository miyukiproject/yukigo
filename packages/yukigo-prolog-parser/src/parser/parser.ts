import { AST, YukigoParser } from "@yukigo/ast";
import nearley from "nearley";
import grammar from "./grammar.js";

export class YukigoPrologParser implements YukigoParser {
  public errors: string[] = [];
  public parse(code: string): AST {
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    parser.feed(code);
    parser.finish();
    /*     try {
    } catch (error) {
      const token = error.token;
      const message = `Unexpected '${token.type}' token '${token.value}' at line ${token.line} col ${token.col}.`;
      this.errors.push(message);
      throw Error(message);
    } */
    if (parser.results.length > 1) {
      this.errors.push(
        `Too much ambiguity. ${parser.results.length} ASTs. Output not generated.`
      );
      throw Error(
        `Too much ambiguity. ${parser.results.length} ASTs. Output not generated.`
      );
    }
    if (parser.results.length == 0) {
      this.errors.push("Parser did not generate an AST.");
      throw Error("Parser did not generate an AST.");
    }

    return parser.results[0];
  }
}
