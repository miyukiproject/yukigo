import grammar from "../parser/preprocessor.js";
import nearley from "nearley";

export function preprocessor(input: string): string {
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
  try {
    parser.feed(input);
    parser.finish();
  } catch (error) {
    const token = error.token;
    const message = `Preprocessor: Unexpected '${token.type}' token '${token.value}' at line ${token.line} col ${token.col}.`;
    throw Error(message);
  }
  if (parser.results.length > 1) {
    throw Error(`Preprocessor: Too much ambiguity. ${parser.results.length} ASTs parsed. Output not generated.`);
  }
  if (parser.results.length == 0) {
    throw Error("Preprocessor: Parser did not generate an AST.");
  }
  return parser.results[0];
}
