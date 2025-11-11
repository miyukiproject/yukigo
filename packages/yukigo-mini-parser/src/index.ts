import { YukigoParser } from "@yukigo/ast";
import nearley from "nearley";
import grammar from "./grammar.js";

export class YukigoMiniParser implements YukigoParser {
  public errors: string[] = [];

  public parse(code: string) {
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    try {
      parser.feed(code);
      parser.finish();
    } catch (error) {
      const token = error.token;
      const message = `Unexpected '${token.type}' token '${token.value}' at line ${token.line} col ${token.col}.`;
      this.errors.push(message)
    }
    const results = parser.results
    if(results.length > 1)
      throw Error(`Ambiguous grammar. The parser generated ${results.length} ASTs`)

    return results[0]
  }
}
